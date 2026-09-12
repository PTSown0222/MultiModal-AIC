import argparse
from collections import defaultdict
import json
import os
from pathlib import Path
import numpy as np
import torch
from FlagEmbedding import FlagReranker

from config import MainConfig
from models.clip_model import ClipModel
from models.mobile_clip_model import MobileCLIP


def reciprocal_rank_fusion(
    ranked_lists: list[list[str]], k: int = 60
) -> list[tuple[str, float]]:
    """
    Hợp nhất thứ hạng từ nhiều mô hình bằng Reciprocal Rank Fusion (RRF).
    ranked_lists: [[key_0, key_1, ...], [key_1, key_2, ...]]
    k: Hằng số RRF (thường chọn 60)
    """
    rrf_scores = defaultdict(float)
    for ranked_list in ranked_lists:
        for rank, doc_key in enumerate(ranked_list, start=1):
            rrf_scores[doc_key] += 1.0 / (k + rank)

    return sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)


def load_model_and_embeddings(model_type: str, cfg: MainConfig):
    """
    Tự động load mô hình (MobileCLIP hoặc CLIP) và đọc ma trận embedding .npz tương ứng.
    """
    model_cfg = cfg.get_model(model_type)
    models_dir = os.path.join(cfg.outputs_models, model_type)

    if model_type == "mobile_clip":
        offline_path = Path(
            "outputs/models/mobile_clip/models--timm--MobileCLIP2-S0-OpenCLIP/snapshots/095906d28bf54d7584dc411e8ffe448f34289e05/open_clip_model.safetensors"
        )
        weights_path = (
            str(offline_path) if offline_path.exists() else model_cfg.pretrained
        )
        print(f"-> Khởi tạo MobileCLIP: {model_cfg.model_name}")
        model = MobileCLIP(
            model_name=model_cfg.model_name,
            pretrained=weights_path,
            device=model_cfg.device,
        )
        npz_dir = Path("outputs/img_embddings/index_single_mobile_clip")
        if not npz_dir.exists():
            npz_dir = Path("outputs/img_embddings/index_shards_mobile_clip")

    elif model_type == "clip":
        print(
            f"-> Khởi tạo CLIP: {model_cfg.model_name} ({model_cfg.pretrained})"
        )
        model = ClipModel(
            model_name=model_cfg.model_name,
            pretrained=model_cfg.pretrained,
            device=model_cfg.device,
        )
        npz_dir = Path("outputs/img_embddings/index_single_clip")
        if not npz_dir.exists():
            npz_dir = Path("outputs/img_embddings/index_shards_clip")
    else:
        raise ValueError(f"Không hỗ trợ loại model: {model_type}")

    # Đọc kho embeddings .npz
    npz_cache = {}
    if npz_dir.exists():
        for npz_file in npz_dir.glob("*.npz"):
            try:
                data = np.load(npz_file)
                emb_key = next(
                    (
                        k
                        for k in ["embeddings", "embs", "arr_0"]
                        if k in data.files
                    ),
                    data.files[0],
                )
                npz_cache[npz_file.stem] = data[emb_key]
            except Exception as e:
                print(f"Lỗi khi đọc file {npz_file.name}: {e}")
    else:
        print(f"[Cảnh báo] Thư mục vector không tồn tại: {npz_dir}")

    return model, npz_cache


def build_aligned_matrices(metadata_list: list, npz_cache_a: dict, npz_cache_b: dict):
    """
    Căn chỉnh metadata và trích xuất ma trận vector song song cho cả 2 models,
    đảm bảo cùng một chỉ số dòng tương ứng chính xác với cùng một keyframe.
    """
    valid_items = []
    matrix_a, matrix_b = [], []

    for item in metadata_list:
        vid, fid = item.get("video_id", ""), item.get("frame_id", "")
        if vid not in npz_cache_a or vid not in npz_cache_b:
            continue
        try:
            idx = int("".join(filter(str.isdigit, fid))) - 1
            embs_a = npz_cache_a[vid]
            embs_b = npz_cache_b[vid]

            if 0 <= idx < len(embs_a) and 0 <= idx < len(embs_b):
                vec_a = embs_a[idx].astype("float32").flatten()
                norm_a = np.linalg.norm(vec_a)
                if norm_a > 0:
                    vec_a /= norm_a

                vec_b = embs_b[idx].astype("float32").flatten()
                norm_b = np.linalg.norm(vec_b)
                if norm_b > 0:
                    vec_b /= norm_b

                matrix_a.append(vec_a)
                matrix_b.append(vec_b)
                # Tạo key định danh duy nhất cho mỗi frame
                item["doc_key"] = f"{vid}/{fid}"
                valid_items.append(item)
        except Exception:
            continue

    if not valid_items:
        raise ValueError("Không tìm thấy keyframe nào trùng khớp giữa metadata và cả 2 kho vector!")

    return valid_items, np.vstack(matrix_a), np.vstack(matrix_b)


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

    # Xếp hạng giảm dần theo điểm Reranker
    return sorted(candidates, key=lambda x: x["rerank_score"], reverse=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipeline RRF (MobileCLIP + CLIP) -> BGE-Reranker")
    parser.add_argument("--query", type=str, default="phú yên trốn thuế", help="Query tìm kiếm")
    parser.add_argument("--stage1_topk", type=int, default=50, help="Số lượng ứng viên lấy ra từ mỗi model")
    parser.add_argument("--rrf_k", type=int, default=60, help="Hằng số k của RRF")
    parser.add_argument("--fusion_topk", type=int, default=30, help="Số lượng ứng viên sau RRF đưa vào Reranker")
    parser.add_argument("--final_topk", type=int, default=5, help="Số kết quả hiển thị cuối cùng")
    args = parser.parse_args()

    cfg = MainConfig()

    print("[1/4] Đang khởi tạo các mô hình và trích xuất vector...")
    mobile_model, mobile_npz = load_model_and_embeddings("mobile_clip", cfg)
    clip_model, clip_npz = load_model_and_embeddings("clip", cfg)

    meta_path = Path("outputs/metadata/combined_metadata.json")
    with open(meta_path, "r", encoding="utf-8") as f:
        meta_list = json.load(f)

    aligned_metadata, mobile_mat, clip_mat = build_aligned_matrices(
        meta_list, mobile_npz, clip_npz
    )
    meta_dict = {item["doc_key"]: item for item in aligned_metadata}
    print(f"-> Đã căn chỉnh thành công {len(aligned_metadata)} keyframes cho cả 2 mô hình.\n")

    # ==================== ENCODE QUERY CHO CẢ 2 MODELS ====================
    print(f"[2/4] Đang tính toán Dense Retrieval cho Query: '{args.query}'...")
    prompt = f"a photo of a {args.query}" if len(args.query.split()) <= 2 else args.query

    with torch.no_grad():
        # Encode MobileCLIP
        q_vec_mobile = mobile_model.encode_text(prompt).cpu().numpy().flatten()
        norm_m = np.linalg.norm(q_vec_mobile)
        if norm_m > 0:
            q_vec_mobile /= norm_m

        # Encode CLIP
        q_vec_clip = clip_model.encode_text(prompt).cpu().numpy().flatten()
        norm_c = np.linalg.norm(q_vec_clip)
        if norm_c > 0:
            q_vec_clip /= norm_c

    # ==================== STAGE 1: TÍNH L2 & LẤY RANKING CHO TỪNG MODEL ====================
    # 1. Xếp hạng theo MobileCLIP
    l2_mobile = np.linalg.norm(mobile_mat - q_vec_mobile, axis=1)
    top_mobile_idx = np.argsort(l2_mobile)[: args.stage1_topk]
    mobile_ranked_keys = [aligned_metadata[i]["doc_key"] for i in top_mobile_idx]

    # 2. Xếp hạng theo CLIP
    l2_clip = np.linalg.norm(clip_mat - q_vec_clip, axis=1)
    top_clip_idx = np.argsort(l2_clip)[: args.stage1_topk]
    clip_ranked_keys = [aligned_metadata[i]["doc_key"] for i in top_clip_idx]

    # ==================== RECIPROCAL RANK FUSION (RRF) ====================
    print(f"[3/4] Thực hiện Reciprocal Rank Fusion (RRF, k={args.rrf_k})...")
    fused_ranks = reciprocal_rank_fusion([mobile_ranked_keys, clip_ranked_keys], k=args.rrf_k)

    # Gom các ứng viên sau RRF
    rrf_candidates = []
    for doc_key, rrf_score in fused_ranks[: args.fusion_topk]:
        cand = meta_dict[doc_key].copy()
        cand["rrf_score"] = float(rrf_score)
        rrf_candidates.append(cand)

    print(f"-> Lấy ra {len(rrf_candidates)} candidates tốt nhất sau RRF để đưa qua Reranker.")

    # ==================== STAGE 2: BGE-RERANKER ====================
    print("[4/4] Đang chạy BGE-Reranker-v2-m3 trên tập ứng viên RRF...")
    final_results = rerank_topk_candidates(args.query, rrf_candidates)

    print("\n" + "=" * 85)
    print(f"BẢNG KẾT QUẢ TOP {args.final_topk} (MOBILECLIP + CLIP --RRF--> BGE-RERANKER)")
    print("=" * 85)
    for rank, res in enumerate(final_results[: args.final_topk], 1):
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
        if len(ocr_str) > 65:
            ocr_str = ocr_str[:65] + "..."

        print(
            f"Top {rank:02d} | Rerank Score: {res['rerank_score']:.4f} | RRF Score: {res['rrf_score']:.5f}"
        )
        print(f"       Keyframe       : {res['doc_key']}")
        print(f"       Vật thể (YOLO) : {objs_str}")
        print(f"       Chữ (OCR)      : {ocr_str}")
        print("-" * 85)