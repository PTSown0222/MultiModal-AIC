"""
CLI:
    PYTHONPATH=. uv run python generate_summary.py outputs/keyframes
"""
import argparse
import cv2 as cv
import os
import numpy as np
import csv

def seconds_to_time_string(ms):
    """Chuyển đổi mili-giây sang định dạng MM:SS hoặc HH:MM:SS"""
    seconds = int(ms // 1000)
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    else:
        return f"{minutes:02d}:{secs:02d}"

class Summary:
    def __init__(self, cols, rows, twidth, theight):
        self.cols = cols
        self.rows = rows
        self.num = cols * rows
        self.twidth = twidth
        self.theight = theight

class ShotItem:
    def __init__(self, keyframe, ms):
        self.keyframe = keyframe
        self.ms = ms

def main():
    parser = argparse.ArgumentParser(description="Tạo ảnh summary tổng hợp từ kho keyframes và ts_ms.npy")
    parser.add_argument("keyframes_root", type=str, help="Đường dẫn thư mục chứa kho keyframes (vd: outputs/keyframes)")
    parser.add_argument("--summary-path", type=str, default="outputs/summaries", help="Thư mục lưu ảnh summary")
    parser.add_argument("--twidth", type=int, default=320, help="Chiều rộng của một thumbnail trong lưới")
    parser.add_argument("--theight", type=int, default=180, help="Chiều cao của một thumbnail trong lưới")
    args = parser.parse_args()

    if not os.path.exists(args.summary_path):
        os.makedirs(args.summary_path, exist_ok=True)

    csvfile_path = os.path.join(args.summary_path, 'summaries.csv')
    csvfile = open(csvfile_path, 'a', newline='', encoding='utf-8')
    writer = csv.writer(csvfile, delimiter=',')

    summaries_config = [
        Summary(1, 1, args.twidth, args.theight),
        Summary(2, 2, args.twidth, args.theight),
        Summary(4, 3, args.twidth, args.theight),
        Summary(6, 4, args.twidth, args.theight),
        Summary(10, 6, args.twidth, args.theight),
        Summary(11, 7, args.twidth, args.theight),
        Summary(13, 8, args.twidth, args.theight),
        Summary(14, 9, args.twidth, args.theight),
        Summary(16, 10, args.twidth, args.theight),
        Summary(18, 11, args.twidth, args.theight)
    ]

    # Duyệt qua từng video trong kho keyframes
    for videoid in os.listdir(args.keyframes_root):
        video_dir = os.path.join(args.keyframes_root, videoid)
        if not os.path.isdir(video_dir):
            continue
            
        ts_file = os.path.join(video_dir, "ts_ms.npy")
        if not os.path.exists(ts_file):
            print(f"[Warning] Không tìm thấy ts_ms.npy cho video: {videoid}")
            continue
            
        ts_ms_array = np.load(ts_file)
        keyframe_files = sorted([f for f in os.listdir(video_dir) if f.lower().endswith((".jpg", ".png"))])

        if not keyframe_files:
            continue

        shots = []
        for idx, file in enumerate(keyframe_files):
            fkeyframe = os.path.join(video_dir, file)
            img = cv.imread(fkeyframe)
            if img is None:
                continue
            
            current_ms = ts_ms_array[idx] if idx < len(ts_ms_array) else 0
            shots.append(ShotItem(img, current_ms))

        if not shots:
            continue

        vid_out_dir = os.path.join(args.summary_path, videoid)
        os.makedirs(vid_out_dir, exist_ok=True)

        scount = 1
        for summary in summaries_config:
            rows = summary.rows
            cols = summary.cols
            
            # Tối ưu hóa số hàng/cột dựa trên số lượng keyframe thực tế
            while cols > rows and len(shots) / cols < rows and cols > 1 and len(shots) / (cols-1) <= (cols-1)*rows:
                cols -= 1
            while rows > 1 and len(shots) <= cols * (rows-1):
                rows -= 1
            while len(shots) <= (cols-1) * rows:
                cols -= 1

            img_canvas = np.zeros((rows * summary.theight, cols * summary.twidth, 3), dtype="uint8")
            
            # Lấy số lượng shot vừa đủ cho lưới
            active_shots = shots[:summary.num]

            i = 0
            for r in range(0, rows):
                for c in range(0, cols):
                    if len(active_shots) > i:
                        shot = active_shots[i]
                        thumb = cv.resize(src=shot.keyframe, dsize=(summary.twidth, summary.theight))
                        
                        # Burn timestamp lên từng ô thumbnail nhỏ
                        time_str = seconds_to_time_string(shot.ms)
                        font = cv.FONT_HERSHEY_SIMPLEX
                        cv.putText(thumb, time_str, (12, 28), font, 0.6, (0, 0, 0), 3, cv.LINE_AA)
                        cv.putText(thumb, time_str, (12, 28), font, 0.6, (0, 255, 255), 1, cv.LINE_AA)

                        img_canvas[r*summary.theight:(r+1)*summary.theight, c*summary.twidth:(c+1)*summary.twidth] = thumb
                    i += 1

            sumname = f"{videoid}_summary_{scount}_{len(shots)}_{cols}_{rows}.jpg"
            outfile = os.path.join(vid_out_dir, sumname)
            print(f"[Summary] Saving: {outfile}")
            cv.imwrite(outfile, img_canvas)

            writer.writerow([videoid, scount, len(shots), cols, rows, sumname])

            if len(shots) <= summary.num:
                break
            scount += 1

    csvfile.close()
    print("[Completed] Đã tạo xong tất cả các ảnh summary tích hợp timestamp!")

if __name__ == "__main__":
    main()