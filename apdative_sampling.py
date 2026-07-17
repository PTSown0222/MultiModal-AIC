from __future__ import annotations
import argparse, glob, os, re, shutil, subprocess, time, json
from pathlib import Path
import numpy as np

def _ffmpeg_bin():
    b = shutil.which("ffmpeg")
    if b: return b
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"

FFMPEG = _ffmpeg_bin()

def _coll_from_path(path: str) -> str:
    up = path.upper()
    for c in ("V3C1", "V3C2"):
        if c in up: return c.lower()
    return "v3c"

def list_videos(roots):
    vids = []
    for root in roots:
        coll = Path(root).name.lower()
        for mp4 in sorted(glob.glob(os.path.join(root, "videos", "*", "*.mp4"))):
            vids.append((f"{coll}_{Path(mp4).stem}", mp4))
    return vids

def list_from_file(path):
    vids = []
    for line in open(path):
        mp4 = line.strip()
        if mp4: vids.append((f"{_coll_from_path(mp4)}_{Path(mp4).stem}", mp4))
    return vids

def extract_sbd_adaptive(mp4: str, out_dir: str, scene_threshold: float = 0.3):
    """
    Sử dụng FFmpeg để phát hiện chuyển cảnh (SBD) và lọc lấy mẫu thích ứng (Adaptive Sampling).
    Trả về danh sách file ảnh vật lý và cấu trúc JSON Annotation cho từng Shot.
    """
    os.makedirs(out_dir, exist_ok=True)
    
    # Lấy tổng thời lượng video trước (để làm mốc kết thúc cho Shot cuối cùng)
    duration_cmd = [FFMPEG, "-i", mp4]
    dur_proc = subprocess.run(duration_cmd, stderr=subprocess.PIPE, stdout=subprocess.DEVNULL)
    dur_match = re.search(r"Duration:\s+(\d+):(\d+):([0-9.]+)", dur_proc.stderr.decode("utf-8", "ignore"))
    total_ms = 0
    if dur_match:
        h, m, s = dur_match.groups()
        total_ms = int((int(h) * 3600 + int(m) * 60 + float(s)) * 1000)

    # Lệnh FFmpeg: Kết hợp bộ lọc phát hiện chuyển cảnh (scene) và in log showinfo
    pat = os.path.join(out_dir, "f_%05d.jpg")
    cmd = [
        FFMPEG, "-hide_banner", "-loglevel", "info",
        "-i", mp4,
        "-vf", f"select='gt(scene,{scene_threshold})',showinfo", 
        "-vsync", "0", "-q:v", "3", pat
    ]
    
    proc = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.DEVNULL)
    log_output = proc.stderr.decode("utf-8", "ignore")
    
    # Trích xuất toàn bộ timestamp (giây) của các frame thỏa mãn tiêu chí SBD
    pts_re = re.compile(r"pts_time:([0-9.]+)")
    pts_seconds = [float(x) for x in pts_re.findall(log_output)]
    pts_ms = [int(round(x * 1000)) for x in pts_seconds]
    
    # Lấy danh sách file ảnh thực tế đã xuất ra ổ cứng
    extracted_files = sorted(glob.glob(os.path.join(out_dir, "f_*.jpg")))
    
    # Đồng bộ hóa ảnh và mốc thời gian (Misalignment fallback)
    n = min(len(extracted_files), len(pts_ms))
    for extra in extracted_files[n:]:
        os.remove(extra)
    valid_files = extracted_files[:n]
    valid_ts = pts_ms[:n]

    # Quy trình: ADAPTIVE SAMPLING & TẠO METADATA ANNOTATION
    # Đảm bảo luôn có mốc bắt đầu là 0ms và mốc kết thúc là cuối video
    shot_boundaries = [0] + valid_ts + [total_ms if total_ms > 0 else (valid_ts[-1] + 1000 if valid_ts else 1000)]
    shot_boundaries = sorted(list(set(shot_boundaries))) # Loại trùng lặp nếu có

    annotations = []
    final_keep_files = []
    final_keep_ts = []
    
    # Duyệt qua từng Shot dựa trên các ranh giới cảnh vừa tìm được
    for idx in range(len(shot_boundaries) - 1):
        start_shot = shot_boundaries[idx]
        end_shot = shot_boundaries[idx + 1]
        duration_shot = end_shot - start_shot
        
        # Tìm các khung hình nằm trong khoảng thời gian của Shot này
        frames_in_shot = [
            (f, t) for f, t in zip(valid_files, valid_ts) 
            if start_shot <= t < end_shot
        ]
        
        # --- THỰC HIỆN ADAPTIVE SAMPLING ---
        sampled_frames = []
        if len(frames_in_shot) > 0:
            if duration_shot < 2000:  # Shot quá ngắn (< 2 giây): Chỉ lấy 1 khung hình đầu tiên
                sampled_frames = [frames_in_shot[0]]
            elif duration_shot < 10000:  # Shot vừa (2 - 10 giây): Lấy tối đa 2 khung hình (đầu và giữa/cuối)
                indices = [0, len(frames_in_shot) - 1]
                sampled_frames = [frames_in_shot[i] for i in sorted(list(set(indices)))]
            else:  # Shot dài (> 10 giây): Lấy mẫu thích ứng tối đa 4 khung hình trải đều
                step = max(1, len(fraåmes_in_shot) // 4)
                sampled_frames = [frames_in_shot[i] for i in range(0, len(frames_in_shot), step)[:4]]
        
        # Lưu thông tin Annotation của Shot này
        shot_data = {
            "shot_id": idx,
            "start_ms": start_shot,
            "end_ms": end_shot,
            "duration_ms": duration_shot,
            "keyframes": [Path(f).name for f, t in sampled_frames],
            "timestamps_ms": [t for f, t in sampled_frames]
        }
        annotations.append(shot_data)
        
        # Giữ lại các file được chọn trong danh mục hệ thống
        for f, t in sampled_frames:
            final_keep_files.append(f)
            final_keep_ts.append(t)

    # Dọn dẹp ổ cứng: Xóa bỏ các khung hình bị từ chối bởi thuật toán Adaptive Sampling
    for f in valid_files:
        if f not in final_keep_files:
            try: os.remove(f)
            except: pass

    # Đổi tên lại các file giữ lại theo thứ tự liên tục tăng dần (Ví dụ: k_00001.jpg, k_00002.jpg)
    ordered_files = []
    for i, old_path in enumerate(sorted(final_keep_files)):
        new_name = os.path.join(out_dir, f"k_{i+1:05d}.jpg")
        os.rename(old_path, new_name)
        ordered_files.append(new_name)
        
        # Cập nhật lại tên file mới vào cấu trúc Json Metadata vừa tạo
        old_base = Path(old_path).name
        for shot in annotations:
            if old_base in shot["keyframes"]:
                idx_f = shot["keyframes"].index(old_base)
                shot["keyframes"][idx_f] = Path(new_name).name

    return ordered_files, final_keep_ts, annotations

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dataset-root", action="append", default=[])
    p.add_argument("--video-list", default=None, help="file with one .mp4 path per line")
    p.add_argument("--out", required=True, help="keyframes and metadata output dir")
    p.add_argument("--scene-threshold", type=float, default=0.3, help="SBD threshold (0.3-0.5 standard)")
    p.add_argument("--shard-index", type=int, default=0)
    p.add_argument("--shard-count", type=int, default=1)
    p.add_argument("--limit", type=int, default=0)
    args = p.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    fail_log = out / f"failed_keyframes_shard{args.shard_index}.txt"

    vids = list_from_file(args.video_list) if args.video_list else list_videos(args.dataset_root)
    if not vids: raise SystemExit("no videos found.")
    
    mine = [v for i, v in enumerate(vids) if i % args.shard_count == args.shard_index]
    if args.limit: mine = mine[:args.limit]
    print(f"[shard {args.shard_index}/{args.shard_count}] Processing {len(mine)} videos", flush=True)

    t0 = time.time(); done = nframes = failed = 0
    for vid, mp4 in mine:
        vdir = out / vid
        json_path = vdir / "annotation.json"
        ts_path = vdir / "ts_ms.npy"
        
        # Cơ chế chạy bù (Resumable) kiểm tra file json mới
        if json_path.exists() and ts_path.exists():
            done += 1
            continue
        try:
            # Gọi hàm SBD và Adaptive Sampling mới
            files, ts, annotations = extract_sbd_adaptive(mp4, str(vdir), args.scene_threshold)
            if not files: raise RuntimeError("zero keyframes extracted after adaptive sampling")
            
            # 1. Lưu file mảng numpy timestamps gốc như cũ để tương thích ngược
            np.save(ts_path, np.asarray(ts, dtype=np.int32))
            
            # 2. Lưu file Metadata Annotation dạng JSON
            with open(json_path, "w", encoding="utf-8") as fj:
                json.dump(annotations, fj, indent=4, ensure_ascii=False)
                
            nframes += len(files)
        except Exception as ex:
            failed += 1
            shutil.rmtree(vdir, ignore_errors=True)
            with open(fail_log, "a") as f: f.write(f"{vid}\t{ex}\n")
            
        done += 1
        if done % 10 == 0:
            el = time.time() - t0
            print(f"[shard {args.shard_index}] {done}/{len(mine)} vids | {nframes} frames saved | fail={failed} | {done/el*60:.1f} vids/min", flush=True)
            
    print(f"[shard {args.shard_index}] Completed in {time.time()-t0:.1f}s", flush=True)

if __name__ == "__main__":
    main()
