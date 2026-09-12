import argparse
import json
import os
from pathlib import Path


def merge_all_metadata(outputs_dir, output_meta_dir):
    outputs_path = Path(outputs_dir)
    master_metadata = {}

    def get_or_create_entry(video_id, frame_id):
        key = (video_id, frame_id)
        if key not in master_metadata:
            master_metadata[key] = {
                "video_id": video_id,
                "frame_id": frame_id,
                "ocr_text": "",
                "objects": [],
            }
        return master_metadata[key]

    # 1. Đọc và gom dữ liệu OCR
    ocr_dir = outputs_path / "ocr"
    if ocr_dir.exists():
        for json_file in ocr_dir.glob("*.json"):
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Dữ liệu là danh sách các video
                for vid_entry in data:
                    vid_id = vid_entry.get("video_id", "")
                    for frame in vid_entry.get("frames", []):
                        f_id = frame.get("frame_id", "")
                        entry = get_or_create_entry(vid_id, f_id)
                        entry["ocr_text"] = frame.get("text", "")

    # 2. Đọc và gom dữ liệu YOLO Objects
    obj_dir = outputs_path / "yolo_results"
    if obj_dir.exists():
        for json_file in obj_dir.glob("*.json"):
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                for vid_entry in data:
                    vid_id = vid_entry.get("video_id", "")
                    for frame in vid_entry.get("frames", []):
                        f_id = frame.get("frame_id", "")
                        entry = get_or_create_entry(vid_id, f_id)
                        # Lưu danh sách bounding boxes và nhãn vật thể
                        entry["objects"] = frame.get("objects", [])

    # 3. Xuất file metadata hoàn chỉnh
    final_data = list(master_metadata.values())
    os.makedirs(output_meta_dir, exist_ok=True)
    output_json_path = Path(output_meta_dir) / "combined_metadata.json"

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)

    print(
        f"[Success] Đã tổng hợp thành công {len(final_data)} keyframes vào: {output_json_path}"
    )
    return output_json_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Combine OCR and YOLO results into a unified metadata JSON"
    )
    parser.add_argument(
        "--inputs_dir",
        type=str,
        default="outputs",
        help="Thư mục gốc chứa module outputs/ocr và outputs/yolo_results",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default="outputs/metadata",
        help="Thư mục xuất metadata tổng hợp",
    )
    args = parser.parse_args()

    print("=== BẮT ĐẦU TỔNG HỢP METADATA ===")
    merge_all_metadata(args.inputs_dir, args.output_dir)