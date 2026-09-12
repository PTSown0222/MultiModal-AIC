# keyframe_selection/extract_keyframes.py
"""
This file uses i-frame for detections
CLI:
    # run with one long video
    uv run python -m keyframes_selection.extract_keyframes --video samples_data/long_video/L21_V001.mp4
    uv run python -m keyframes_selection.extract_keyframes --video samples_data/V3C1/02031/02031.mp4
    # run with batch, try with 3 samples
    uv run python -m keyframes_selection.extract_keyframes --dataset-root samples_data --limit 3
    # run with more
    uv run python -m keyframes_selection.extract_keyframes --dataset-root samples_data
"""
import argparse, glob, os, re, shutil, subprocess, time
from pathlib import Path
import numpy as np 
from utils import get_project_root, get_output_dir, list_videos, list_from_file, coll_from_path

PTS_RE = re.compile(r"pts_time:([0-9.]+)")

def _ffmpeg_bin():
    b = shutil.which("ffmpeg")
    if b:
        return b
    try:  # bundled static ffmpeg (cluster nodes lack a system ffmpeg)
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"

FFMPEG = _ffmpeg_bin()

def extract_keyframes(mp4: str, out_dir: str):
    """One ffmpeg pass. Writes k_*.jpg into out_dir; returns (jpg_paths, ts_ms) aligned."""
    os.makedirs(out_dir, exist_ok=True)
    pat = os.path.join(out_dir, "k_%05d.jpg")
    cmd = [FFMPEG, "-hide_banner", "-loglevel", "info", "-skip_frame", "nokey",
           "-i", mp4, "-vsync", "0", "-vf", "showinfo", "-q:v", "3", pat]
    proc = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.DEVNULL)
    pts = [float(x) for x in PTS_RE.findall(proc.stderr.decode("utf-8", "ignore"))]
    files = sorted(glob.glob(os.path.join(out_dir, "k_*.jpg")))
    if not pts:  # fallback: spread evenly (rare — showinfo gave no pts)
        pts = list(range(len(files)))
    n = min(len(files), len(pts))
    for extra in files[n:]:  # drop any jpgs past known timestamps (rare misalignment)
        os.remove(extra)
    ts = [int(round(pts[i] * 1000)) for i in range(n)]
    return files[:n], ts

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--video", default=None, help="path to a single .mp4 video file")
    p.add_argument("--video-list", default=None, help="file with one .mp4 path per line")
    p.add_argument("--dataset-root", action="append", default=[], help="root directories to scan")
    p.add_argument("--out", default=str(get_output_dir("keyframes")), help="keyframes output dir")
    p.add_argument("--shard-index", type=int, default=0)
    p.add_argument("--shard-count", type=int, default=1)
    p.add_argument("--limit", type=int, default=0)
    args = p.parse_args()

    out = Path(args.out)
    out.mkdir(parents = True, exist_ok = True)
    fail_log = out / f"failed_keyframes_shard{args.shard_index}.txt"

    if args.video:
        path_obj = Path(args.video).resolve()
        coll = coll_from_path(str(path_obj))
        video_id = f"{coll}_{path_obj.stem}"
        vids = [(video_id, str(path_obj))]
    elif args.video_list:
        vids = list_from_file(args.video_list)
    else:
        vids = list_videos(args.dataset_root)
    
    if not vids:
        raise SystemExit("no videos (need --dataset-root or --video-list)")

    mine = [v for i, v in enumerate(vids) if i % args.shard_count == args.shard_index]
    if args.limit:
        mine = mine[:args.limit]
    print(f"[shard {args.shard_index}/{args.shard_count}] {len(mine)}/{len(vids)} videos", flush=True)

    t0 = time.time()
    # init n_frams, n_frames failed and n_frames done
    done = nframes = failed = 0
    for vid, mp4 in mine:
        vdir = out / vid
        ts_path = vdir / "ts_ms.npy"
        if ts_path.exists():  # resumable
            done += 1
            continue
        try:
            files, ts = extract_keyframes(mp4, str(vdir))
            if not files:
                raise RuntimeError("no keyframes")
            np.save(ts_path, np.asarray(ts, dtype=np.int32))  # written last = done marker
            nframes += len(files)
        except Exception as ex:
            failed += 1
            shutil.rmtree(vdir, ignore_errors=True)  # don't leave a half-extracted folder
            with open(fail_log, "a") as f:
                f.write(f"{vid}\t{ex}\n")
        done += 1
        if done % 50 == 0:
            el = time.time() - t0
            print(f"[shard {args.shard_index}] {done}/{len(mine)} | {nframes} keyframes | "
                  f"fail={failed} | {done/el*60:.0f} vids/min | ETA {(len(mine)-done)/max(done/el,1e-9)/60:.0f}min",
                  flush=True)
    print(f"[shard {args.shard_index}] DONE {done} videos, {nframes} keyframes, {failed} failed, "
            f"{time.time() - t0:.0f}s", flush=True)

if __name__ == "__main__":
    main()
        


