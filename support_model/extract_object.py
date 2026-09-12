"""
YOLO Support Model Object Detection CLI (Recursive Batch & Global JSON Output)
uv run python -m support_model.extract_object --input_folder "outputs/keyframes" --output_folder "outputs/yolo_results"
"""

import argparse
import json
from pathlib import Path
from ultralytics import YOLO
from utils import get_output_dir

def load_support_model(model_name="yolo11n.pt"):
    output_dir = get_output_dir("models/yolo11n_model")
    weights_path = output_dir / model_name
    
    if not weights_path.exists():
        temp_model = YOLO(model_name)
        if Path(model_name).exists():
            Path(model_name).rename(weights_path)
            
    model = YOLO(str(weights_path))
    print(f"[Support Model] Loaded YOLO from: {weights_path}")
    return model

def extract_keyframe_objects(model, image_path, conf_threshold=0.3):
    """Trích xuất danh sách đối tượng từ 1 ảnh keyframe"""
    results = model(str(image_path), verbose=False)
    detected_objects = []
    
    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            if conf >= conf_threshold:
                cls_name = model.names[cls_id]
                detected_objects.append({
                    "object": cls_name,
                    "confidence": round(conf, 4),
                    "box": [round(x, 2) for x in box.xyxy[0].tolist()]  # [x1, y1, x2, y2]
                })
                
    return detected_objects

def process_directory_to_single_json(input_folder, output_subfolder="yolo_results", model_name="yolo11n.pt", conf_threshold=0.3):
    model = load_support_model(model_name)
    input_path = Path(input_folder)
    out_dir = get_output_dir(output_subfolder)
    
    folder_name = input_path.name if input_path.name and input_path.name != "keyframes" else "dataset_all"
    json_file = out_dir / f"yolo_{folder_name}.json"

    # Quét toàn bộ file ảnh .jpg và .png trong mọi cấp độ thư mục con
    list_files = sorted(list(input_path.rglob("*.jpg")) + list(input_path.rglob("*.png")))
    total_files = len(list_files)

    if total_files == 0:
        print(f"[Lỗi] Không tìm thấy file ảnh .jpg/.png nào trong: {input_folder}")
        return

    print(f"[YOLO] Tìm thấy {total_files} frames. Bắt đầu Object Detection...")

    video_grouped_data = {}

    for count, file_full_path in enumerate(list_files, start=1):
        frame_id = file_full_path.stem
        video_id = file_full_path.parent.name  

        print(f"[{count}/{total_files}] Video: {video_id} | Frame: {frame_id}")

        objects = extract_keyframe_objects(model, file_full_path, conf_threshold=conf_threshold)

        if video_id not in video_grouped_data:
            video_grouped_data[video_id] = {
                "video_id": video_id,
                "frames": []
            }
        
        video_grouped_data[video_id]["frames"].append({
            "frame_id": frame_id,
            "objects": objects
        })

    final_json_output = list(video_grouped_data.values())

    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(final_json_output, f, ensure_ascii=False, indent=4)
        
    print(f"\n[Thành công] Đã lưu file YOLO JSON toàn cục tại: {json_file}")

def main():
    parser = argparse.ArgumentParser(description="YOLO Batch Object Detection CLI (Global JSON)")
    parser.add_argument("--input_folder", required=True, help="Đường dẫn thư mục chứa keyframes")
    parser.add_argument("--output_folder", default="outputs/yolo_results", help="Thư mục lưu file JSON kết quả")
    parser.add_argument("--model-name", default="yolo11n.pt", help="Tên model YOLO")
    parser.add_argument("--conf", type=float, default=0.3, help="Ngưỡng confidence tối thiểu")
    
    args = parser.parse_args()
    process_directory_to_single_json(args.input_folder, args.output_folder, args.model_name, args.conf)

if __name__ == "__main__":
    main()