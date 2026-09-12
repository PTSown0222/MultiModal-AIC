"""
CLI:
    uv run python -m vdb_retrieve.server_mobileclip --port 8001 --shards outputs/img_embddings/index_shards_mobile_clip --root outputs/keyframes
"""
from __future__ import annotations
import sys
from PIL import Image
import torch
import asyncio
import websockets
import json
import numpy as np
import os
import argparse
from pathlib import Path
from websockets.exceptions import ConnectionClosedOK
from models.mobile_clip_model import MobileCLIP
from config import MainConfig

models_dir = os.path.abspath("outputs/models/mobile_clip")
os.environ["TORCH_HOME"] = models_dir
os.environ["HF_HOME"] = models_dir
os.environ["HUGGINGFACE_HUB_CACHE"] = models_dir
os.environ["TIMM_CACHE_DIR"] = models_dir

device = "mps" if torch.backends.mps.is_available() else ("cuda:0" if torch.cuda.is_available() else "cpu")
print(f"[Init] Sử dụng device: {device}")

cfg = MainConfig()
model_cfg = cfg.get_model("mobile_clip")
pretrained_path = "outputs/models/mobile_clip/models--timm--MobileCLIP2-S0-OpenCLIP/snapshots/095906d28bf54d7584dc411e8ffe448f34289e05/open_clip_model.safetensors"

print("[Init] Đang load model MobileCLIP...")
model = MobileCLIP(
    model_name=model_cfg.model_name,
    pretrained=pretrained_path,
    device=device
)
print("[Init] Load model MobileCLIP thành công!")

GLOBAL_INDEX_DATA = None
GLOBAL_VIDS = None
GLOBAL_TS = None
keyframe_base_root = ""

def load_shards_to_memory(shard_dir):
    global GLOBAL_INDEX_DATA, GLOBAL_VIDS, GLOBAL_TS
    print(f"[index] Đang load các shards từ {shard_dir}...")
    embs, vids, ts = [], [], []
    files = sorted(list(Path(shard_dir).glob("*.npz")))
    for f in files:
        d = np.load(f)
        e = d["emb"]
        if e.shape[0] == 0:
            continue
        embs.append(e)
        vid = Path(f).stem
        vids.extend([vid] * e.shape[0])
        ts.append(d["ts_ms"])
    
    if not embs:
        raise SystemExit(f"Không tìm thấy shard nào trong {shard_dir}")
        
    emb = np.concatenate(embs, 0).astype(np.float32)
    ts = np.concatenate(ts, 0).astype(np.int32)
    vids = np.array(vids)
    
    print(f"[index] Load thành công {emb.shape[0]} keyframes từ {len(files)} videos, dim={emb.shape[1]}")
    
    GLOBAL_INDEX_DATA = torch.from_numpy(emb).to(device).half()
    GLOBAL_VIDS = vids
    GLOBAL_TS = ts
    print(f"[Index] Đã đưa toàn bộ {emb.shape[0]} vectors lên RAM/Device sẵn sàng tìm kiếm.")

def search_matrix(query_features, k):
    global GLOBAL_INDEX_DATA
    Qt = query_features.to(device).half()
    sims = (Qt @ GLOBAL_INDEX_DATA.T).float().cpu().numpy()[0]
    top_indices = np.argsort(sims)[::-1][:k]
    top_scores = sims[top_indices]
    return top_scores, top_indices

def filterAndLabelResults(indices, scores, resultsPerPage, selectedPage):
    kfresults = []
    kfresultsidx = []
    kfscores = []
    kftimestamps = [] # Thêm mảng chứa timestamp
    num_results = len(indices)

    if num_results == 0:
        raise Exception("Không tìm thấy kết quả phù hợp.")

    ifrom = (selectedPage - 1) * resultsPerPage
    ito = selectedPage * resultsPerPage

    if ifrom >= num_results:
        return [], [], [], []
    
    for i in range(ifrom, min(ito, num_results)):
        idx = indices[i]
        score = scores[i]
        vid = GLOBAL_VIDS[idx]
        ts_ms = GLOBAL_TS[idx] # Lấy timestamp thực tế từ global data
        
        video_mask = (GLOBAL_VIDS == vid)
        video_indices = np.where(video_mask)[0]
        local_idx = np.where(video_indices == idx)[0]
        kf_index = (local_idx[0] + 1) if len(local_idx) > 0 else 1
        
        kf_path = f"{vid}/k_{kf_index:05d}.jpg"
        
        kfresults.append(kf_path)
        kfresultsidx.append(int(idx))
        kfscores.append(str(score))
        kftimestamps.append(int(ts_ms)) # Đưa timestamp vào danh sách

    return kfresults, kfresultsidx, kfscores, kftimestamps

async def handler(websocket):
    try:
        while True:
            message = await websocket.recv()
            print(f"\n[WebSocket] Nhận message từ client: {message}")
            msg = json.loads(message)
            event = msg['content']
            clientId = msg['clientId']

            if 'ping' not in event:
                with torch.no_grad():
                    k = int(event['maxresults']) 
                    k = min(k, len(GLOBAL_VIDS))
                    resultsPerPage = int(event['resultsperpage'])
                    selectedPage = int(event['selectedpage'])

                    if event['type'] == 'textquery':
                        query_text = event['query']
                        print(f"[Search Text]: {query_text}")
                        text_features = model.encode_text(query_text)
                        if text_features.ndim == 1:
                            text_features = text_features.unsqueeze(0)
                        scores, indices = search_matrix(text_features, k)
                        
                    elif event['type'] == 'file-similarityquery':
                        img_path = os.path.join(keyframe_base_root, event['pathprefix'], event['query'])
                        print(f'[Search Image]: trying to load {img_path}')
                        image = Image.open(img_path).convert("RGB")
                        image_features = model.encode_image(image)
                        if image_features.ndim == 1:
                            image_features = image_features.unsqueeze(0)
                        scores, indices = search_matrix(image_features, k)
                
                    kfresults, kfresultsidx, kfscores, kftimestamps = filterAndLabelResults(indices, scores, resultsPerPage, selectedPage)
                    results = {
                        'num': len(kfresults), 
                        'clientId': clientId, 
                        'totalresults': k, 
                        'results': kfresults, 
                        'resultsidx': kfresultsidx, 
                        'timestamps': kftimestamps, # Thêm key timestamps vào JSON
                        'dataset': 'v3c', 
                        'scores': kfscores
                    }
                    print(f"[Response]: Gửi về {len(kfresults)} kết quả kèm timestamps.")
                    await websocket.send(json.dumps(results))
    except ConnectionClosedOK:
        print("Connection closed gracefully.")
    except Exception as e:
        print("Exception: ", str(e))
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="WebSocket Server chuẩn cho MobileCLIP")
    parser.add_argument("--shards", default="outputs/img_embddings/index_shards_mobile_clip", help="Thư mục chứa shard .npz")
    parser.add_argument("--root", default="outputs/keyframes", help="Thư mục gốc chứa keyframe")
    parser.add_argument("--port", type=int, default=8001, help="Cổng WebSocket server")
    args = parser.parse_args()
    
    keyframe_base_root = args.root
    load_shards_to_memory(args.shards)
    
    async def main_runner():
        async with websockets.serve(handler, "", args.port):
            print(f'Server WebSocket MobileCLIP đang lắng nghe trên cổng {args.port}...')
            await asyncio.Future()

    asyncio.run(main_runner())