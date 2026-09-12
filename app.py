import json
import os
from pathlib import Path
import cv2 as cv
from FlagEmbedding import FlagReranker
import numpy as np
from PIL import Image
from rapidfuzz import fuzz
import streamlit as st
import torch

from config import MainConfig
from models.clip_model import ClipModel
from models.mobile_clip_model import MobileCLIP
from models.siglip2_model import Siglip2Model

st.set_page_config(
    page_title="Two-Stage Search - AIC Video Retrieval",
    layout="wide",
    initial_sidebar_state="expanded",
)

def ms_to_time_str(ms: int):
    seconds = int(ms // 1000)
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    return (
        f"{hours:02d}:{minutes:02d}:{secs:02d}"
        if hours > 0
        else f"{minutes:02d}:{secs:02d}"
    )

@st.cache_data
def locate_video_path(video_id: str):
    clean_long_name = video_id.replace("general_long_video_", "")
    long_file = Path("samples_data/long_video") / f"{clean_long_name}.mp4"
    if long_file.exists():
        return long_file

    direct_long_file = Path("samples_data/long_video") / f"{video_id}.mp4"
    if direct_long_file.exists():
        return direct_long_file

    clean_short_id = video_id.split("_")[-1]
    short_matches = list(
        Path("samples_data/short_video").glob(f"**/*{clean_short_id}*.mp4")
    )
    if short_matches:
        return short_matches[0]

    general_matches = list(
        Path("samples_data").glob(f"**/*{clean_short_id}*.mp4")
    )
    return general_matches[0] if general_matches else None


def get_frame_image(video_id: str, frame_id: str, ts_ms: int):
    """Đọc ảnh từ file sẵn có, nếu mất file thì fallback trích xuất từ video gốc."""
    raw_img_path = Path("outputs/keyframes") / video_id / f"{frame_id}.jpg"
    if raw_img_path.exists():
        img = cv.imread(str(raw_img_path))
        if img is not None:
            return img

    video_path = locate_video_path(video_id)
    if video_path and Path(video_path).exists():
        cap = cv.VideoCapture(str(video_path))
        cap.set(cv.CAP_PROP_POS_MSEC, ts_ms)
        success, frame = cap.read()
        cap.release()
        if success:
            return frame

    return None

# ----------------- 1. LOAD MODELS VÀ EMBEDDINGS DYNAMIC -----------------
@st.cache_resource
def load_vision_model(model_choice: str):
    cfg = MainConfig()

    if model_choice == "MobileCLIP":
        mobile_cfg = cfg.get_model("mobile_clip")
        offline_path = Path(
            "outputs/models/mobile_clip/models--timm--MobileCLIP2-S0-OpenCLIP/snapshots/095906d28bf54d7584dc411e8ffe448f34289e05/open_clip_model.safetensors"
        )
        weights_path = (
            str(offline_path) if offline_path.exists() else mobile_cfg.pretrained
        )
        return MobileCLIP(
            model_name=mobile_cfg.model_name,
            pretrained=weights_path,
            device=mobile_cfg.device,
        )

    elif model_choice == "CLIP ViT-B-32":
        clip_cfg = cfg.get_model("clip")
        offline_path = Path(
            "outputs/models/clip/models--laion--CLIP-ViT-B-32-laion2B-s34B-b79K/snapshots/1a25a446712ba5ee05982a381eed697ef9b435cf/open_clip_model.safetensors"
        )
        weights_path = (
            str(offline_path) if offline_path.exists() else clip_cfg.pretrained
        )
        return ClipModel(
            model_name=clip_cfg.model_name,
            pretrained=weights_path,
            device=clip_cfg.device,
        )

    elif model_choice == "SigLIP2 ViT-B-16":
        siglip_cfg = cfg.get_model("siglip2")
        offline_siglip = Path(
            "outputs/models/siglip2/models--timm--ViT-B-16-SigLIP2/snapshots/eee10eff6dd8cabae2d7f379d4e8cfcd352030aa/open_clip_model.safetensors"
        )
        fallback_clip = Path(
            "outputs/models/mobile_clip/models--timm--ViT-B-16-SigLIP2/snapshots/eee10eff6dd8cabae2d7f379d4e8cfcd352030aa/open_clip_model.safetensors"
        )
        weights_path = (
            str(offline_siglip)
            if offline_siglip.exists()
            else str(fallback_clip)
            if fallback_clip.exists()
            else siglip_cfg.pretrained
        )
        return Siglip2Model(
            model_name=siglip_cfg.model_name,
            pretrained=weights_path,
            device=siglip_cfg.device,
        )

    raise ValueError(f"Không hỗ trợ model: {model_choice}")


@st.cache_resource
def load_bge_reranker():
    # Load trực tiếp model name, FlagReranker tự cache vào ~/.cache/huggingface
    # use_fp16=False để tương thích hoàn toàn với macOS CPU/MPS
    return FlagReranker("BAAI/bge-reranker-v2-m3", use_fp16=False)


@st.cache_data
def load_dataset(model_choice: str):
    meta_path = Path("outputs/metadata/combined_metadata.json")

    model_folder_mapping = {
        "MobileCLIP": "mobile_clip",
        "CLIP ViT-B-32": "clip",
        "SigLIP2 ViT-B-16": "siglip2",
    }
    folder_slug = model_folder_mapping.get(model_choice, "mobile_clip")
    npz_dir = Path(f"outputs/img_embddings/index_shards_{folder_slug}")

    if not meta_path.exists():
        st.error(f"Không tìm thấy metadata: {meta_path}")
        return [], None, str(npz_dir)

    with open(meta_path, "r", encoding="utf-8") as f:
        meta_list = json.load(f)

    npz_cache = {}
    if npz_dir.exists():
        for npz_file in npz_dir.glob("*.npz"):
            vid_name = npz_file.stem
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
                ts_key = "ts_ms" if "ts_ms" in data.files else None

                npz_cache[vid_name] = {
                    "embeddings": data[emb_key],
                    "ts_ms": data[ts_key] if ts_key else None,
                }
            except Exception as e:
                st.warning(f"Lỗi khi đọc file {npz_file.name}: {e}")

    valid_meta = []
    vector_list = []

    for item in meta_list:
        vid = item.get("video_id", "")
        fid = item.get("frame_id", "")

        if vid not in npz_cache:
            continue

        try:
            idx = int("".join(filter(str.isdigit, fid))) - 1
        except ValueError:
            continue

        video_embs = npz_cache[vid]["embeddings"]
        if 0 <= idx < len(video_embs):
            vec = video_embs[idx].astype("float32").flatten()
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm

            if (
                npz_cache[vid]["ts_ms"] is not None
                and idx < len(npz_cache[vid]["ts_ms"])
            ):
                item["ts_ms"] = int(npz_cache[vid]["ts_ms"][idx])
            else:
                item["ts_ms"] = 0

            vector_list.append(vec)
            valid_meta.append(item)

    if not vector_list:
        return [], None, str(npz_dir)

    return valid_meta, np.vstack(vector_list), str(npz_dir)


@st.cache_data
def extract_unique_objects(meta_path_str="outputs/metadata/combined_metadata.json"):
    p = Path(meta_path_str)
    if not p.exists():
        return []
    with open(p, "r", encoding="utf-8") as f:
        meta_list = json.load(f)
    all_labels = set()
    for item in meta_list:
        for obj in item.get("objects", []):
            if isinstance(obj, dict):
                label = obj.get("object", "").strip().lower()
                if label:
                    all_labels.add(label)
    return sorted(list(all_labels))


available_objects = extract_unique_objects()
bge_reranker = load_bge_reranker()


# ----------------- 2. HÀM VẼ BOUNDING BOX VẬT THỂ -----------------
def draw_yolo_boxes(
    img_bgr: np.ndarray, objects_list: list, target_objects: list = None
):
    if img_bgr is None:
        return None

    img = img_bgr.copy()
    target_set = set([o.lower().strip() for o in (target_objects or [])])

    for obj in objects_list:
        if not isinstance(obj, dict):
            continue
        label = obj.get("object", "").lower()
        conf = obj.get("confidence", 0.0)
        box = obj.get("box", [])

        if len(box) != 4:
            continue

        is_match = label in target_set if target_set else False
        box_color = (0, 255, 0) if is_match else (0, 0, 255)

        x1, y1, x2, y2 = int(box[0]), int(box[1]), int(box[2]), int(box[3])
        cv.rectangle(img, (x1, y1), (x2, y2), box_color, 2)

        caption = f"{label} {conf:.2f}"
        cv.putText(
            img,
            caption,
            (x1, max(y1 - 6, 15)),
            cv.FONT_HERSHEY_SIMPLEX,
            0.5,
            box_color,
            2,
            cv.LINE_AA,
        )

    return cv.cvtColor(img, cv.COLOR_BGR2RGB)


# ----------------- 3. SIDEBAR TRUY VẤN & CẤU HÌNH -----------------
st.sidebar.markdown("## ⚡ **SEARCH PANEL**")
st.sidebar.markdown("---")

model_choice = st.sidebar.selectbox(
    "Vision Encoder Model",
    options=["SigLIP2 ViT-B-16", "CLIP ViT-B-32", "MobileCLIP"],
    index=0,
    help="Chọn mô hình Dense Retrieval. Thư mục shard tương ứng sẽ tự động được nạp.",
)

vision_model = load_vision_model(model_choice)
metadata_db, emb_matrix, loaded_folder = load_dataset(model_choice)

st.sidebar.caption(f"📁 Shards path: `{loaded_folder}`")
if emb_matrix is not None:
    st.sidebar.caption(
        f"📊 Vector count: `{emb_matrix.shape[0]}` (Dim: `{emb_matrix.shape[1]}`)"
    )
else:
    st.sidebar.error("Chưa có shards embeddings cho model này!")

st.sidebar.markdown("---")

search_mode = st.sidebar.radio(
    "Search Mode Selection",
    ["Text", "Image"],
    horizontal=True,
    label_visibility="collapsed",
)

query_text = ""
if search_mode == "Text":
    query_text = st.sidebar.text_input(
        "Query Text Input",
        placeholder="Nhập mô tả (vd: phú yên trốn thuế, a person)...",
        label_visibility="collapsed",
    )

uploaded_file = None
if search_mode == "Image":
    uploaded_file = st.sidebar.file_uploader(
        "Upload Query Image",
        type=["jpg", "png", "jpeg"],
        label_visibility="collapsed",
    )

st.sidebar.markdown("---")
st.sidebar.markdown("**Cấu hình Two-Stage Retrieval**")

use_reranker = st.sidebar.checkbox(
    "🚀 Kích hoạt BGE-Reranker-v2-M3", value=True
)
stage1_topk = st.sidebar.slider(
    "Stage 1 Candidates (L2 Retrieval)",
    min_value=15,
    max_value=100,
    value=40,
    step=5,
)

st.sidebar.markdown("---")
st.sidebar.markdown("**Metadata Filters**")

ocr_filter = st.sidebar.text_input(
    "OCR Filter Label",
    placeholder="Lọc từ khóa OCR...",
    label_visibility="collapsed",
)

fuzzy_threshold = st.sidebar.slider(
    "Ngưỡng khớp OCR (Fuzzy %)",
    min_value=30,
    max_value=100,
    value=50,
    step=5,
    help="Tỷ lệ trùng khớp tối thiểu giữa từ khóa và chữ OCR.",
)

selected_objects = st.sidebar.multiselect(
    "Lọc vật thể YOLO",
    options=available_objects,
    default=[],
    placeholder="Chọn nhãn vật thể...",
)

show_boxes = st.sidebar.checkbox("Hiển thị Bounding Box", value=True)

st.sidebar.markdown("---")
top_k = st.sidebar.slider(
    "Số kết quả hiển thị (Final Top K)",
    min_value=1,
    max_value=30,
    value=12,
    label_visibility="collapsed",
)

search_button = st.sidebar.button(
    "🔍 Search Keyframes", use_container_width=True
)

# ----------------- 4. PIPELINE TWO-STAGE RETRIEVAL -----------------
st.title(f"🎬 Video Retrieval: {model_choice} ➡️ BGE-Reranker")
st.caption(
    f"Stage 1: {model_choice} + L2 Distance | Stage 2: Cross-Encoder BGE-M3 (OCR + YOLO Context) + Late Fusion"
)

if search_button:
    if emb_matrix is None or len(metadata_db) == 0:
        st.error(
            f"Dữ liệu vector cho model `{model_choice}` chưa sẵn sàng trong thư mục `{loaded_folder}`!"
        )
        st.stop()

    query_vec = None

    if search_mode == "Text" and query_text.strip():
        raw_text = query_text.strip()
        prompt = (
            f"a photo of a {raw_text}"
            if len(raw_text.split()) <= 2
            else raw_text
        )
        with torch.no_grad():
            feat_tensor = vision_model.encode_text(prompt)
            query_vec = feat_tensor.cpu().numpy().flatten()

    elif search_mode == "Image" and uploaded_file is not None:
        pil_img = Image.open(uploaded_file).convert("RGB")
        with torch.no_grad():
            feat_tensor = vision_model.encode_images([pil_img])
            query_vec = feat_tensor.cpu().numpy().flatten()

    if query_vec is not None:
        q_norm = np.linalg.norm(query_vec)
        if q_norm > 0:
            query_vec = query_vec / q_norm

        diff = emb_matrix - query_vec
        l2_distances = np.linalg.norm(diff, axis=1)
    else:
        l2_distances = np.zeros(len(metadata_db), dtype="float32")

    all_sorted_idxs = np.argsort(l2_distances)

    ocr_target = ocr_filter.lower().strip()
    target_objs_set = set([o.lower().strip() for o in selected_objects])

    candidates = []
    for idx in all_sorted_idxs:
        item = metadata_db[idx]

        raw_objs = item.get("objects", [])
        item_labels = set(
            [
                o.get("object", "").lower()
                for o in raw_objs
                if isinstance(o, dict) and o.get("object")
            ]
        )
        if target_objs_set and not target_objs_set.issubset(item_labels):
            continue

        item_ocr = item.get("ocr_text", "").lower().strip()
        ocr_ratio = 0.0
        if ocr_target:
            ocr_ratio = (
                float(fuzz.partial_token_set_ratio(ocr_target, item_ocr))
                if item_ocr
                else 0.0
            )
            if ocr_ratio < fuzzy_threshold:
                continue

        cand = item.copy()
        cand["l2_distance"] = float(l2_distances[idx])
        cand["ocr_match_ratio"] = ocr_ratio
        cand["objects_str"] = ", ".join(sorted(list(item_labels))) or "None"
        candidates.append(cand)

        if len(candidates) >= stage1_topk:
            break

    if candidates:
        if use_reranker and search_mode == "Text" and query_text.strip():
            with st.spinner("Đang chạy BGE-Reranker-v2-M3 & Late Fusion..."):
                pairs = []
                for cand in candidates:
                    objs_str = cand.get("objects_str", "None")
                    ocr_val = cand.get("ocr_text", "").strip()
                    doc_text = f"Vật thể: {objs_str} | Chữ trên màn hình: {ocr_val or 'None'}"
                    pairs.append([query_text.strip(), doc_text])

                scores = bge_reranker.compute_score(pairs, normalize=True)
                for i, cand in enumerate(candidates):
                    cand["rerank_score"] = float(scores[i])
        else:
            for cand in candidates:
                cand["rerank_score"] = 0.0

        for cand in candidates:
            visual_sim = 1.0 / (1.0 + cand["l2_distance"])
            cand["visual_sim"] = visual_sim

            if not ocr_target:
                item_ocr = cand.get("ocr_text", "").lower().strip()
                cand["ocr_match_ratio"] = (
                    float(
                        fuzz.partial_token_set_ratio(
                            query_text.lower().strip(), item_ocr
                        )
                    )
                    if item_ocr
                    else 0.0
                )

            fuzzy_boost = cand["ocr_match_ratio"] / 100.0
            r_score = cand.get("rerank_score", 0.0)

            cand["final_score"] = (
                0.55 * visual_sim + 0.30 * r_score + 0.15 * fuzzy_boost
            )

        candidates.sort(key=lambda x: x["final_score"], reverse=True)
        final_results = candidates[:top_k]
    else:
        final_results = []

    # ----------------- 5. HIỂN THỊ KẾT QUẢ VÀ PLAYER -----------------
    if final_results:
        st.success(
            f"Tìm thấy {len(final_results)} kết quả phù hợp bằng [{model_choice}]:"
        )

        cols = st.columns(3)
        for idx, res in enumerate(final_results):
            with cols[idx % 3]:
                frame_bgr = get_frame_image(
                    res["video_id"], res["frame_id"], res.get("ts_ms", 0)
                )

                if frame_bgr is not None:
                    if show_boxes and res.get("objects"):
                        final_img = draw_yolo_boxes(
                            frame_bgr,
                            res["objects"],
                            target_objects=selected_objects,
                        )
                        st.image(final_img, use_container_width=True)
                    else:
                        st.image(
                            cv.cvtColor(frame_bgr, cv.COLOR_BGR2RGB),
                            use_container_width=True,
                        )
                else:
                    st.warning(
                        f"Không load được frame cho `{res['video_id']}` (ID: {res['frame_id']})"
                    )

                formatted_time = ms_to_time_str(res["ts_ms"])
                exact_seconds = res["ts_ms"] / 1000.0
                start_play_time = max(0, int(exact_seconds - 1.5))

                fuzzy_display = (
                    f" | Fuzzy: `{res['ocr_match_ratio']:.0f}%`"
                    if res.get("ocr_match_ratio", 0) > 0
                    else ""
                )
                score_info = (
                    f"Final: `{res['final_score']:.3f}` | "
                    f"Rerank: `{res.get('rerank_score', 0.0):.4f}` | "
                    f"L2: `{res['l2_distance']:.3f}`{fuzzy_display}"
                )

                st.markdown(f"**Rank {idx+1}** | {score_info}")
                st.caption(
                    f"📁 `{res['video_id']}` | Frame: `{res['frame_id']}` | ⏱️ `{formatted_time}`"
                )
                st.caption(f"🏷️ **Objects:** `{res['objects_str']}`")
                st.caption(
                    f"📝 **OCR:** `{res['ocr_text'][:50]}...`"
                    if len(res.get("ocr_text", "")) > 50
                    else f"📝 **OCR:** `{res.get('ocr_text') or 'None'}`"
                )

                video_file_path = locate_video_path(res["video_id"])

                with st.expander(f"▶️ Phát Video tại {formatted_time}"):
                    if video_file_path and video_file_path.exists():
                        with open(video_file_path, "rb") as vf:
                            video_bytes = vf.read()
                        st.video(video_bytes, start_time=start_play_time)
                        st.caption(
                            f"📁 Source: `{video_file_path}` | Bắt đầu từ: `{start_play_time}s`"
                        )
                    else:
                        st.info(
                            f"Không tìm thấy file video cho ID: `{res['video_id']}`"
                        )

                st.markdown("---")
    else:
        st.warning("Không tìm thấy khung hình nào thỏa mãn các điều kiện tìm kiếm.")