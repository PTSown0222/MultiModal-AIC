import json
import faiss
import numpy as np

# Tải index và lookup table vào RAM
index = faiss.read_index("keyframes_faiss.index")
with open("faiss_metadata_lookup.json", "r", encoding="utf-8") as f:
    lookup_table = json.load(f)


def search_keyframes(query_vector, top_k=10):
    # query_vector: numpy array (1, DIM)
    query_vector = query_vector.astype("float32")
    faiss.normalize_L2(query_vector)

    # Tìm kiếm
    scores, indices = index.search(query_vector, top_k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx == -1:
            continue
        meta = lookup_table[idx]
        results.append(
            {
                "score": float(score),
                "video_id": meta["video_id"],
                "frame_id": meta["frame_id"],
                "ocr_text": meta["ocr_text"],
                "objects": meta["objects"],
            }
        )
    return results