"""
<<<<<<< HEAD
Strict JSON OCR Extraction CLI for Video Keyframes
=======
easyOCR for extract text in frames
>>>>>>> 33d301d7a62ae8dd1d1ba845d3dc22970fc36dac
"""

import os
import cv2
<<<<<<< HEAD
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
=======
import glob
import argparse
import easyocr
import csv
import sys
import pandas as pd

def process_img_ocr(input_folder, output_folder):
    reader = easyocr.Reader(['vi', 'en'])
    count = 1

    # Create output folder if it does not exist
    os.makedirs(output_folder, exist_ok=True)

    folder_name = os.path.basename(os.path.normpath(input_folder))
    csv_file = os.path.join(output_folder, f"ocr_{folder_name}.csv")

    # Tìm tất cả file ảnh dạng k_*.jpg trong thư mục đầu vào
    search_path = os.path.join(input_folder, "**/k_*.jpg")
    list_files = sorted(glob.glob(search_path, recursive=True))
    total_files = len(list_files)

    if total_files == 0:
        print(f"cannot find any k_*.jpg in {input_folder}")
        return

    with open(csv_file, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(['Folder', 'File', 'Text'])

        for count, file_full_path in enumerate(list_files, start=1):
            file_name = os.path.basename(file_full_path)
            
            # Lấy tên thư mục con chứa file ảnh đó (ví dụ: v3c1_02031)
            parent_folder = os.path.basename(os.path.dirname(file_full_path))

            print(f"Processing {parent_folder}/{file_name} - {count} of {total_files}")

            image = cv2.imread(file_full_path)
            if image is None:
                print(f"Error: Unable to open image {file}")
                continue
            
            result = reader.readtext(file_full_path, detail=0, batch_size=10)
            
            formatted_text = ', '.join(result)

            csv_writer.writerow([parent_folder, file_name, formatted_text])

            count += 1
    
    print(f"CSV file saved as: {csv_file}")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--input_folder", required=True, help="input folder to read frames")
    ap.add_argument("--output_folder", required=True, help="output folder to save csv text after extraction")
    args = ap.parse_args()

    saved_csv = process_img_ocr(args.input_folder, args.output_folder)
    
    # if saved_csv and os.path.exists(saved_csv):
    #     print("\n--- Previewing first 5 rows of the generated CSV ---")
    #     with open(saved_csv, 'r', encoding='utf-8') as f:
    #         reader = csv.reader(f)
    #         for i, row in enumerate(reader):
    #             if i >= 6: 
    #                 break
    #             print(row)
>>>>>>> 33d301d7a62ae8dd1d1ba845d3dc22970fc36dac
