from __future__ import annotations
import torch
import numpy as np
import argparse, json, time
from pathlib import Path
from models.clip_model import ClipModel
from models.mobile_clip_model import MobileCLIP
from config import MainConfig
import os

pretrained_path = "outputs/models/mobile_clip/models--timm--MobileCLIP2-S0-OpenCLIP/snapshots/095906d28bf54d7584dc411e8ffe448f34289e05/open_clip_model.safetensors"
models_dir = os.path.abspath("outputs/models/mobile_clip")
os.environ["TORCH_HOME"] = models_dir
os.environ["HF_HOME"] = models_dir
os.environ["HUGGINGFACE_HUB_CACHE"] = models_dir
os.environ["TIMM_CACHE_DIR"] = models_dir

def load_index(shard_dir):
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
    emb = np.concatenate(embs, 0)
    ts = np.concatenate(ts, 0).astype(np.int32)
    vids = np.array(vids)
    print(f"[index] Load thành công {emb.shape[0]} keyframes từ {len(files)} videos, dim={emb.shape[1]}", flush=True)
    return emb, vids, ts

def main():
    parser = argparse.ArgumentParser(description="Chạy retrieval trực tiếp không dùng FAISS index dựng sẵn")
    parser.add_argument("--shards", default="outputs/img_embddings/index_shards_mobile_clip", help="Thư mục chứa các file .npz shard")
    parser.add_argument("--query", default="a man surfing", help="Câu lệnh truy vấn text")
    parser.add_argument("--top-videos", type=int, default=5)
    parser.add_argument("--cand-keyframes", type=int, default=400)
    args = parser.parse_args()

    print("[Init] Bắt đầu khởi tạo cấu hình...", flush=True)
    cfg = MainConfig()
    model_cfg = cfg.get_model("mobile_clip")
    print(f"[Init] Sử dụng device: {model_cfg.device}", flush=True)

    # Load index trực tiếp từ thư mục npz shards
    emb, vids, ts = load_index(args.shards)

    print("[Init] Đang load model MobileCLIP...", flush=True)
    try:
        model = MobileCLIP(
            model_name=model_cfg.model_name,
            pretrained=pretrained_path,
            device=model_cfg.device
        )
        print("[Init] Load model thành công!", flush=True)
    except Exception as e:
        print(f"[Error] Lỗi khi load model: {e}", flush=True)
        return

    print(f"\n[Search] Đang mã hóa câu query: '{args.query}'", flush=True)
    with torch.no_grad():
        # Encode text query trả về tensor [1, D]
        text_features = model.encode_text(args.query)
        if text_features.ndim == 1:
            text_features = text_features.unsqueeze(0)
        
        Q = text_features.detach().cpu().numpy().astype(np.float32)

    dev = model_cfg.device
    idx = torch.from_numpy(emb).to(dev).half()
    Qt = torch.from_numpy(Q).to(dev).half()
    T, N = Qt.shape[0], idx.shape[0]
    K = min(args.cand_keyframes, N)

    CH = 200_000
    top_val = torch.full((T, K), float("-inf"), device=dev, dtype=torch.float16)
    top_idx = torch.zeros((T, K), device=dev, dtype=torch.long)
    
    t0 = time.time()
    for s in range(0, N, CH):
        e = min(s + CH, N)
        sims = Qt @ idx[s:e].T
        cat_v = torch.cat([top_val, sims], 1)
        cat_i = torch.cat([top_idx, torch.arange(s, e, device=dev).expand(T, e - s)], 1)
        top_val, sel = cat_v.topk(K, dim=1)
        top_idx = torch.gather(cat_i, 1, sel)
        
    print(f"[retrieve] Đã tính toán xong trên {N} keyframes trong {time.time()-t0:.2f}s", flush=True)

    top_idx = top_idx.cpu().numpy()
    top_val = top_val.float().cpu().numpy()

    rows = top_idx[0]
    sims = top_val[0]
    seen = {}
    for r, sim in zip(rows, sims):
        v = str(vids[r])
        if v in seen:
            continue
        center = int(ts[r])
        seen[v] = (center, float(sim))
        if len(seen) >= args.top_videos:
            break

    print("\n=== KẾT QUẢ TÌM KIẾM KÈM KEYFRAME ===")
    for rank, (v, (center, sim)) in enumerate(seen.items(), 1):
        # Giả sử tên file keyframe đánh số từ 1 tương ứng với vị trí/index, 
        # hoặc bạn có thể dựa vào fps để suy ra số thứ tự frame (ví dụ: cách nhau 1s hoặc theo index trong mảng)
        # Cách an toàn nhất là tìm file ảnh gần nhất hoặc dùng index `r` trong mảng vids
        
        # Tìm lại index của r trong vids để biết đây là keyframe thứ mấy của video đó
        video_mask = (vids == v)
        video_indices = np.where(video_mask)[0]
        local_idx = np.where(video_indices == rows[rank-1])[0]
        
        # Format tên file keyframe theo convention trong thư mục outputs/keyframes/{video_id}/k_{idx:05d}.jpg
        # (Thường index trong thư mục keyframes tính từ 1)
        kf_index = (local_idx[0] + 1) if len(local_idx) > 0 else 1
        kf_path = Path(f"outputs/keyframes/{v}/k_{kf_index:05d}.jpg")
        
        print(f"Rank {rank}: Video = {v} | Time = {center}ms | Score = {sim:.4f}")
        print(f"➔ Keyframe path: {kf_path} (Exists: {kf_path.exists()})")

if __name__ == "__main__":
    main()