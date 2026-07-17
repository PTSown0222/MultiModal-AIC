import os
import json
import torch
import argparse
from pathlib import Path
from PIL import Image
from tqdm import tqdm
from transformers import BlipProcessor, BlipForConditionalGeneration

def get_caption(model, processor, image_path, device):
    """Hàm tách biệt để dễ quản lý"""
    try:
        raw_image = Image.open(image_path).convert('RGB')
        inputs = processor(raw_image, return_tensors="pt").to(device)
        out = model.generate(**inputs, max_new_tokens=25)
        return processor.decode(out[0], skip_special_tokens=True)
    except Exception as e:
        return f"Error: {e}"

def add_captions_to_annotations(keyframes_root, shard_idx, shard_count, limit):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)

    # Lấy danh sách video theo shard
    video_dirs = sorted([d for d in Path(keyframes_root).iterdir() if d.is_dir()])
    mine = [d for i, d in enumerate(video_dirs) if i % shard_count == shard_idx]
    
    if limit > 0:
        mine = mine[:limit]

    for vdir in tqdm(mine, desc=f"Captioning Shard {shard_idx}"):
        json_path = vdir / "annotation.json"
        if not json_path.exists(): continue
        
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        updated = False
        for shot in data:
            if "caption" not in shot:
                keyframe_name = shot["keyframes"][0] 
                kf_path = vdir / keyframe_name
                
                if kf_path.exists():
                    shot["caption"] = get_caption(model, processor, kf_path, device)
                    updated = True
        
        if updated:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Captioning keyframes for Video RAG")
    parser.add_argument("--keyframes", default="artifacts/keyframes", help="Root dir of keyframes")
    parser.add_argument("--shard-index", type=int, default=0)
    parser.add_argument("--shard-count", type=int, default=1)
    parser.add_argument("--limit", type=int, default=0, help="Debug: limit videos")
    args = parser.parse_args()

    add_captions_to_annotations(args.keyframes, args.shard_index, args.shard_count, args.limit)