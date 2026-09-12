import json
import os
import faiss
import numpy as np

# Cấu hình
DIM = 512  # Đổi thành 768 nếu dùng ViT-L/14
METADATA_FILE = "outputs/metadata/combined_metadata.json"
EMB_DIR = "outputs/img_embddings"
OUTPUT_INDEX = "keyframes_faiss.index"
OUTPUT_LOOKUP = "faiss_metadata_lookup.json"

# 2. Đọc metadata đã tổng hợp
with open(METADATA_FILE, "r", encoding="utf-8") as f:
    metadata_list = json.load(f)

vectors = []
lookup_table = []

for item in metadata_list:
    vid = item["video_id"]
    fid = item["frame_id"]

    emb_path = os.path.join(EMB_DIR, vid, f"{fid}.npy")
    if not os.path.exists(emb_path):
        continue

    vec = np.load(emb_path).astype("float32").flatten()

    # Chuẩn hóa L2 để tìm kiếm Cosine Similarity bằng Inner Product
    faiss.normalize_L2(vec.reshape(1, -1))

    vectors.append(vec)
    lookup_table.append(
        {
            "video_id": vid,
            "frame_id": fid,
            "ocr_text": item.get("ocr_text", ""),
            "objects": [obj["object"] for obj in item.get("objects", [])],
        }
    )

# 3. Tạo index FAISS
vectors_np = np.vstack(vectors).astype("float32")
index = faiss.IndexFlatIP(DIM)  # IndexFlatIP đo Inner Product (Cosine sau khi chuẩn hóa)
index.add(vectors_np)

# 4. Lưu index và lookup map
faiss.write_index(index, OUTPUT_INDEX)
with open(OUTPUT_LOOKUP, "w", encoding="utf-8") as f:
    json.dump(lookup_table, f, ensure_ascii=False)

print(f"[Done] Đã index {index.ntotal} frames vào {OUTPUT_INDEX}")