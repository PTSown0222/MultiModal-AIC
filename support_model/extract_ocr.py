"""
Strict JSON OCR Extraction CLI for Video Keyframes
"""

import os
import cv2
import argparse
import easyocr
import json
from pathlib import Path

def get_output_dir(sub_path):
    """Tự động tạo và trả về thư mục đầu ra"""
    out_dir = Path(sub_path)
    out_dir.mkdir(parents=True, exist_ok=True)
    return out_dir

def process_img_ocr(input_folder, output_folder):
    print("[OCR] Đang khởi tạo mô hình EasyOCR (vi, en)...")
    reader = easyocr.Reader(['vi', 'en'], gpu=True)

    out_dir = get_output_dir(output_folder)
    
    input_path = Path(input_folder)
    folder_name = input_path.name if input_path.name else "dataset_all"
    json_file = out_dir / f"ocr_{folder_name}.json"

    # Quét toàn bộ file ảnh .jpg và .png trong mọi thư mục con
    list_files = sorted(list(input_path.rglob("*.jpg")) + list(input_path.rglob("*.png")))
    total_files = len(list_files)

    if total_files == 0:
        print(f"[Lỗi] Không tìm thấy file ảnh .jpg/.png nào trong thư mục: {input_folder}")
        return

    print(f"[OCR] Tìm thấy tổng cộng {total_files} frames. Bắt đầu xử lý...")

    video_grouped_data = {}

    for count, file_full_path in enumerate(list_files, start=1):
        frame_id = file_full_path.stem
        video_id = file_full_path.parent.name  

        print(f"[{count}/{total_files}] Video: {video_id} | Frame: {frame_id}")

        image = cv2.imread(str(file_full_path))
        if image is None:
            print(f"  -> Cảnh báo: Không thể mở file ảnh {file_full_path}")
            continue
        
        # Trích xuất OCR
        result = reader.readtext(str(file_full_path), detail=0, batch_size=10)
        formatted_text = ' '.join([word.strip() for line in result for word in line.split() if word.strip()])

        # Gom nhóm theo cấu trúc JSON chuẩn
        if video_id not in video_grouped_data:
            video_grouped_data[video_id] = {
                "video_id": video_id,
                "frames": []
            }
        
        video_grouped_data[video_id]["frames"].append({
            "frame_id": frame_id,
            "text": formatted_text
        })

    final_json_output = list(video_grouped_data.values())

    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(final_json_output, f, ensure_ascii=False, indent=4)
    
    print(f"\n[Thành công] Đã lưu file JSON tại: {json_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OCR Extraction for Video Retrieval")
    parser.add_argument("--input_folder", required=True, help="Đường dẫn đến thư mục chứa keyframes")
    parser.add_argument("--output_folder", default="outputs/ocr", help="Thư mục lưu file JSON kết quả")
    args = parser.parse_args()

    process_img_ocr(args.input_folder, args.output_folder)