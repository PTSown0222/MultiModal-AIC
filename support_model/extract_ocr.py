"""
easyOCR for extract text in frames
"""

import os
import cv2
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
    
    if saved_csv and os.path.exists(saved_csv):
        print("\n--- Previewing first 5 rows of the generated CSV ---")
        with open(saved_csv, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for i, row in enumerate(reader):
                if i >= 6: 
                    break
                print(row)