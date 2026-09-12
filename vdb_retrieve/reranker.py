import argparse
import json
import os
from pathlib import Path
import numpy as np
import torch
from FlagEmbedding import FlagReranker

from config import MainConfig
from models.mobile_clip_model import MobileCLIP


def rerank_topk_candidates(
    query_text: str,
    candidates: list,
    reranker_model_name: str = "BAAI/bge-reranker-v2-m3",
):
    if not candidates or not query_text.strip():
        return candidates

    model_dir = Path("outputs/models/cross_encoder_reranker")
    if model_dir.exists() and any(model_dir.iterdir()):
        model_path = str(model_dir)
    else:
        model_dir.mkdir(parents=True, exist_ok=True)
        reranker_init = FlagReranker(reranker_model_name, use_fp16=True)
        reranker_init.model.save_pretrained(model_dir)
        reranker_init.tokenizer.save_pretrained(model_dir)
        model_path = str(model_dir)

    reranker = FlagReranker(model_path, use_fp16=True)

    pairs = []
    for cand in candidates:
        raw_objs = cand.get("objects", [])
        if isinstance(raw_objs, list):
            objs_list = [
                o.get("object", "")
                for o in raw_objs
                if isinstance(o, dict) and o.get("object")
            ]
            objs_str = ", ".join(sorted(list(set(objs_list))))
        else:
            objs_str = str(raw_objs)

        ocr_val = cand.get("ocr_text", "").strip()
        doc_text = f"Vật thể: {objs_str or 'None'} | Chữ trên màn hình: {ocr_val or 'None'}"
        pairs.append([query_text.strip(), doc_text])

    scores = reranker.compute_score(pairs, normalize=True)

    for i, cand in enumerate(candidates):
        cand["rerank_score"] = float(scores[i])

    reranked_results = sorted(
        candidates, key=lambda x: x["rerank_score"], reverse=True
    )
    return reranked_results


def load_real_dataset_and_model():
    cfg = MainConfig()
    mobile_cfg = cfg.get_model("mobile_clip")
    offline_path = "outputs/models/mobile_clip/models--timm--MobileCLIP2-S0-OpenCLIP/snapshots/095906d28bf54d7584dc411e8ffe448f34289e05/open_clip_model.safetensors"
    weights_path = (
        offline_path if os.path.exists(offline_path) else mobile_cfg.pretrained
    )

    print("[1/3] Loading MobileCLIP Model...")
    model = MobileCLIP(
        model_name=mobile_cfg.model_name,
        pretrained=weights_path,
        device=mobile_cfg.device,
    )

    print("[2/3] Loading Metadata và Embeddings từ NPZ...")
    meta_path = Path("outputs/metadata/combined_metadata.json")
    npz_dir = Path("outputs/img_embddings/index_single_mobile_clip")
    if not npz_dir.exists():
        npz_dir = Path("outputs/img_embddings/index_shards_mobile_clip")

    with open(meta_path, "r", encoding="utf-8") as f:
        meta_list = json.load(f)

    npz_cache = {}
    for npz_file in npz_dir.glob("*.npz"):
        data = np.load(npz_file)
        emb_key = next(
            (k for k in ["embeddings", "embs", "arr_0"] if k in data.files),
            data.files[0],
        )
        npz_cache[npz_file.stem] = data[emb_key]

    valid_meta = []
    vector_list = []
    for item in meta_list:
        vid, fid = item.get("video_id", ""), item.get("frame_id", "")
        if vid not in npz_cache:
            continue
        try:
            idx = int("".join(filter(str.isdigit, fid))) - 1
            if 0 <= idx < len(npz_cache[vid]):
                vec = npz_cache[vid][idx].astype("float32").flatten()
                norm = np.linalg.norm(vec)
                if norm > 0:
                    vec /= norm
                vector_list.append(vec)
                valid_meta.append(item)
        except Exception:
            continue

    return model, valid_meta, np.vstack(vector_list)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Kiểm thử Pipeline: MobileCLIP Stage 1 -> BGE-Reranker Stage 2"
    )
    parser.add_argument(
        "--query",
        type=str,
        default="phú yên trốn thuế",
        help="Query tiếng Việt",
    )
    parser.add_argument(
        "--stage1_topk",
        type=int,
        default=30,
        help="Số candidate MobileCLIP lấy ra",
    )
    args = parser.parse_args()

    clip_model, metadata_db, emb_matrix = load_real_dataset_and_model()

    print(f"\n[3/3] Bắt đầu tìm kiếm với Query: '{args.query}'")

    # ==================== STAGE 1: MOBILECLIP L2 RETRIEVAL ====================
    # Bọc prompt template cho MobileCLIP
    prompt = (
        f"a photo of a {args.query}"
        if len(args.query.split()) <= 2
        else args.query
    )
    with torch.no_grad():
        query_vec = clip_model.encode_text(prompt).cpu().numpy().flatten()
        q_norm = np.linalg.norm(query_vec)
        if q_norm > 0:
            query_vec /= q_norm

    # Tính L2 distance trên toàn bộ ma trận embedding
    diff = emb_matrix - query_vec
    l2_distances = np.linalg.norm(diff, axis=1)

    # Lấy top candidates có khoảng cách L2 gần nhất
    top_stage1_indices = np.argsort(l2_distances)[: args.stage1_topk]

    stage1_candidates = []
    for idx in top_stage1_indices:
        cand = metadata_db[idx].copy()
        cand["l2_distance"] = float(l2_distances[idx])
        stage1_candidates.append(cand)

    print(
        f"-> Stage 1 (MobileCLIP): Đã trích xuất {len(stage1_candidates)} candidates tiềm năng nhất."
    )

    # In thử top 3 của riêng Stage 1 để bạn so sánh
    print("\n--- TOP 3 KẾT QUẢ GỐC CỦA STAGE 1 (MobileCLIP thuần) ---")
    for r, item in enumerate(stage1_candidates[:3], 1):
        print(
            f"  {r}. {item['video_id']} | Frame: {item['frame_id']} | L2 Distance: {item['l2_distance']:.4f}"
        )

    # ==================== STAGE 2: BGE RERANKER ====================
    print("\n-> Stage 2: Đang chạy BGE-Reranker trên các candidates của Stage 1...")
    final_reranked = rerank_topk_candidates(args.query, stage1_candidates)

    print("\n" + "=" * 80)
    print(f"BẢNG KẾT QUẢ TOP 5 CUỐI CÙNG (SAU KHI ĐƯỢC RERANK BẰNG METADATA)")
    print("=" * 80)
    for rank, res in enumerate(final_reranked[:5], 1):
        raw_objs = res.get("objects", [])
        objs_str = (
            ", ".join(
                list(
                    set(
                        [
                            o.get("object", "")
                            for o in raw_objs
                            if isinstance(o, dict) and o.get("object")
                        ]
                    )
                )
            )
            or "None"
        )
        ocr_str = res.get("ocr_text", "").strip() or "None"
        if len(ocr_str) > 75:
            ocr_str = ocr_str[:75] + "..."

        print(
            f"Top {rank:02d} | Rerank Score: {res['rerank_score']:.4f} | L2 gốc (MobileCLIP): {res['l2_distance']:.4f}"
        )
        print(f"       Video: {res['video_id']} | Frame: {res['frame_id']}")
        print(f"       Vật thể (YOLO) : {objs_str}")
        print(f"       Chữ (OCR)      : {ocr_str}")
        print("-" * 80)