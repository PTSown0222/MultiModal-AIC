"""
CLI:
    uv run python support_model/get_fps.py --video_path "samples_data/short_video/V3C1/videos/02031/02031.mp4"
    or
    uv run python support_model/get_fps.py --video_path "samples_data/long_video/L21_V001.mp4"
    or
    uv run python support_model/get_fps.py --video_path "samples_data/short_video"
"""
"""
Extract FPS, resolution, and metadata for a single video or recursively across folders
"""

import os
import sys
import json
from pathlib import Path
import argparse

# Thêm thư mục gốc vào system path để import utils dễ dàng
sys.path.append(str(Path(__file__).resolve().parent.parent))
from utils import get_output_dir

def process_single_video(video_path_str, output_file):
    video_path = Path(video_path_str)
    if not video_path.is_file():
        print(f"  -> Lỗi: Không tìm thấy file video - {video_path}")
        return None

    filename = video_path.name
    stem = video_path.stem
    parent_dir = video_path.parent.name
    video_id = f"{parent_dir.lower()}_{stem}"
    
    cap = cv2_open(video_path)
    if cap is None or not cap.isOpened():
        print(f"  -> Lỗi: Không thể mở file video - {video_path}")
        return None

    fps = cap.get(3)  # cv2.CAP_PROP_FPS
    total_frames = int(cap.get(7))  # cv2.CAP_PROP_FRAME_COUNT
    width = int(cap.get(3))         # cv2.CAP_PROP_FRAME_WIDTH
    height = int(cap.get(4))        # cv2.CAP_PROP_FRAME_HEIGHT
    cap.release()

    if fps <= 0:
        fps = 25.0  # Fallback an toàn nếu video không đọc được FPS chuẩn
        
    duration_sec = round(total_frames / fps, 2) if fps > 0 else 0.0
    
    metadata_item = {
        "video_id": video_id,
        "filename": filename,
        "path": str(video_path),
        "fps": float(fps),
        "total_frames": total_frames,
        "duration_sec": duration_sec,
        "resolution": [width, height]
    }
    
    print(f"[OK] Video: {video_id} | FPS: {fps} | Frames: {total_frames} | Res: {width}x{height}")
    return video_id, metadata_item

def cv2_open(path):
    import cv2
    return cv2.VideoCapture(str(path))

def main():
    parser = argparse.ArgumentParser(description="Extract video FPS and metadata (Supports single file or recursive directory batch).")
    parser.add_argument("--video_path", required=True, help="Đường dẫn đến file video đơn lẻ hoặc thư mục chứa các video cần quét")
    args = parser.parse_args()

    input_path = Path(args.video_path)
    output_dir = get_output_dir("fps_metadata")
    output_file = output_dir / "metadata_video.json"
    
    metadata = {}
    if output_file.is_file():
        with open(output_file, 'r', encoding='utf-8') as f:
            try:
                metadata = json.load(f)
            except json.JSONDecodeError:
                metadata = {}

    target_video_files = []
    if input_path.is_file():
        target_video_files.append(input_path)
    elif input_path.is_dir():
        # Quét đệ quy toàn bộ file định dạng video phổ biến (.mp4, .avi, .mkv, .mov)
        extensions = [".mp4", ".avi", ".mkv", ".mov", ".flv"]
        target_video_files = sorted([f for f in input_path.rglob("*") if f.suffix.lower() in extensions])

    if not target_video_files:
        print(f"[Cảnh báo] Không tìm thấy file video nào tại: {args.video_path}")
        return

    print(f"[Batch Processing] Tìm thấy {len(target_video_files)} video. Bắt đầu trích xuất metadata...")

    for v_file in target_video_files:
        res = process_single_video(v_file, output_file)
        if res:
            vid_id, v_meta = res
            metadata[vid_id] = v_meta

    # Ghi toàn bộ dữ liệu tập trung ra file JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=4, ensure_ascii=False)

    print(f"\n[Thành công] Đã lưu tổng cộng {len(metadata)} video metadata vào: {output_file}")

if __name__ == "__main__":
    main()