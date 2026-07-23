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
    if not os.path.isfile(path):
        raise FileNotFoundError(f"warnings: Cannot find path at: {path}")
    
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            mp4 = line.strip().strip("'\"") # Xóa dấu nháy/khoảng trắng thừa do bash sinh ra
            if mp4 and os.path.isfile(mp4):
                vids.append((f"{_coll_from_path(mp4)}_{Path(mp4).stem}", mp4))
    return vids

def extract_sbd_adaptive(mp4: str, out_dir: str, scene_threshold: float = 0.3):
    """
    Sử dụng FFmpeg để SBD. Gán chuẩn xác 1 representative frame cho mỗi Shot.
    """
    os.makedirs(out_dir, exist_ok=True)
    
    # Lấy tổng thời lượng video
    duration_cmd = [FFMPEG, "-i", mp4]
    dur_proc = subprocess.run(duration_cmd, stderr=subprocess.PIPE, stdout=subprocess.DEVNULL)
    dur_match = re.search(r"Duration:\s+(\d+):(\d+):([0-9.]+)", dur_proc.stderr.decode("utf-8", "ignore"))
    total_ms = 0
    if dur_match:
        h, m, s = dur_match.groups()
        total_ms = int((int(h) * 3600 + int(m) * 60 + float(s)) * 1000)

    # Chạy SBD
    pat = os.path.join(out_dir, "k_%05d.jpg")
    cmd = [
        FFMPEG, "-hide_banner", "-loglevel", "error", 
        "-i", mp4,
        "-vf", f"select='gt(scene,{scene_threshold})',showinfo", 
        "-vsync", "0", "-q:v", "3", pat
    ]
    
    proc = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.DEVNULL)
    log_output = proc.stderr.decode("utf-8", "ignore")
    
    pts_re = re.compile(r"pts_time:([0-9.]+)")
    pts_seconds = [float(x) for x in pts_re.findall(log_output)]
    pts_ms = [int(round(x * 1000)) for x in pts_seconds]
    
    extracted_files = sorted(glob.glob(os.path.join(out_dir, "k_*.jpg")))
    
    # Đồng bộ hóa
    n = min(len(extracted_files), len(pts_ms))
    for extra in extracted_files[n:]:
        os.remove(extra)
    valid_files = extracted_files[:n]
    valid_ts = pts_ms[:n]

    # FIX LOGIC SHOT BOUNDARIES (Hợp nhất và loại bỏ xung đột)
    if not valid_ts:
        duration_sec = total_ms / 1000
        valid_ts = [int(i * 2000) for i in range(int(max(1, duration_sec // 2)))]
        shot_boundaries = [0, total_ms if total_ms > 0 else 1000]
    else:
        # Chèn mốc 0 và mốc kết thúc, loại bỏ trùng lặp và sắp xếp
        shot_boundaries = sorted(list(set([0] + valid_ts + [total_ms if total_ms > 0 else valid_ts[-1] + 1000])))

    annotations = []
    final_keep_files = []
    final_keep_ts = []
    
    # Duyệt và gán Frame cho Shot (1 Shot = 1 Representative Frame)
    for idx in range(len(shot_boundaries) - 1):
        start_shot = shot_boundaries[idx]
        end_shot = shot_boundaries[idx + 1]
        
        frames_in_shot = [
            (f, t) for f, t in zip(valid_files, valid_ts) 
            if start_shot <= t < end_shot
        ]
        
        if not frames_in_shot:
            continue # Bỏ qua shot không có frame nào được trích xuất
            
        # Lấy duy nhất frame đầu tiên làm đại diện cho cảnh đó
        rep_frame, rep_ts = frames_in_shot[0]
        
        shot_data = {
            "shot_id": idx,
            "start_ms": start_shot,
            "end_ms": end_shot,
            "duration_ms": end_shot - start_shot,
            "keyframes": [Path(rep_frame).name],
            "timestamps_ms": [rep_ts]
        }
        annotations.append(shot_data)
        
        if rep_frame not in final_keep_files:
            final_keep_files.append(rep_frame)
            final_keep_ts.append(rep_ts)

    # Dọn dẹp ổ cứng
    for f in valid_files:
        if f not in final_keep_files:
            try: os.remove(f)
            except: pass

    # Rename tịnh tiến
    ordered_files = []
    for i, old_path in enumerate(sorted(final_keep_files)):
        new_name = os.path.join(out_dir, f"k_{i+1:05d}.jpg")
        os.rename(old_path, new_name)
        ordered_files.append(new_name)
        
        old_base = Path(old_path).name
        for shot in annotations:
            if old_base in shot["keyframes"]:
                shot["keyframes"][0] = Path(new_name).name

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

    # Sẽ throw exception ngay nếu file list có vấn đề, không để bash chạy ngầm gây lỗi
    vids = list_from_file(args.video_list) if args.video_list else list_videos(args.dataset_root)
    if not vids: raise SystemExit("No Videos Found.")
    
    mine = [v for i, v in enumerate(vids) if i % args.shard_count == args.shard_index]
    if args.limit: mine = mine[:args.limit]
    print(f"[Shard {args.shard_index}/{args.shard_count}] Sẵn sàng xử lý {len(mine)} video", flush=True)

    t0 = time.time(); done = nframes = failed = 0
    for vid, mp4 in mine:
        vdir = out / vid
        json_path = vdir / "annotation.json"
        ts_path = vdir / "ts_ms.npy"
        
        if json_path.exists() and ts_path.exists():
            done += 1
            continue
        try:
            files, ts, annotations = extract_sbd_adaptive(mp4, str(vdir), args.scene_threshold)
            if not files: raise RuntimeError("Zero keyframes extracted.")
            
            np.save(ts_path, np.asarray(ts, dtype=np.int32))
            
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
            print(f"[Shard {args.shard_index}] {done}/{len(mine)} vids | {nframes} frames | Fail: {failed} | Tốc độ: {done/el*60:.1f} vids/min", flush=True)
            
    print(f"[Shard {args.shard_index}] Hoàn thành trong {time.time()-t0:.1f}s", flush=True)

if __name__ == "__main__":
    main()