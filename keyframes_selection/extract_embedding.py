"""
CLI Examples:
    # 1. Trích xuất SigLIP2 (khuyên dùng batch-size 16-32 trên MPS)
    uv run python -m keyframes_selection.extract_embedding --keyframes outputs/keyframes --model-type siglip2 --device mps --batch-size 16

    # 2. Trích xuất CLIP ViT-B-32
    uv run python -m keyframes_selection.extract_embedding --keyframes outputs/keyframes --model-type clip --device mps

    # 3. Trích xuất MobileCLIP
    uv run python -m keyframes_selection.extract_embedding --keyframes outputs/keyframes --model-type mobile_clip --device mps

    # 4. Chạy 1 video cụ thể
    uv run python -m keyframes_selection.extract_embedding --keyframes outputs/keyframes --model-type siglip2 --video-name general_long_video_L21_V001 --device mps
"""
import argparse
import glob
import os
from pathlib import Path
import time
import numpy as np
from PIL import Image

# local imports
from config import MainConfig
from models.clip_model import ClipModel
from models.mobile_clip_model import MobileCLIP
from models.siglip2_model import Siglip2Model


def load_model_from_args(
    model_type: str,
    device: str,
    model_name: str = None,
    pretrained: str = None,
):
    """Tự động load đúng class mô hình dựa trên CLI."""
    cfg = MainConfig()
    m_type = model_type.lower()

    if m_type == "clip":
        clip_cfg = cfg.get_model("clip")
        name = model_name or clip_cfg.model_name
        offline_path = Path(
            "outputs/models/clip/models--laion--CLIP-ViT-B-32-laion2B-s34B-b79K/snapshots/1a25a446712ba5ee05982a381eed697ef9b435cf/open_clip_model.safetensors"
        )
        weights = (
            str(offline_path)
            if (offline_path.exists() and not pretrained)
            else (pretrained or clip_cfg.pretrained)
        )
        print(
            f"[Model Loader] Khởi tạo CLIP: {name} (weights: {weights}) trên {device}"
        )
        return ClipModel(model_name=name, pretrained=weights, device=device)

    elif m_type in ["mobile_clip", "mobileclip"]:
        mobile_cfg = cfg.get_model("mobile_clip")
        name = model_name or mobile_cfg.model_name
        offline_path = Path(
            "outputs/models/mobile_clip/models--timm--MobileCLIP2-S0-OpenCLIP/snapshots/095906d28bf54d7584dc411e8ffe448f34289e05/open_clip_model.safetensors"
        )
        weights = (
            str(offline_path)
            if (offline_path.exists() and not pretrained)
            else (pretrained or mobile_cfg.pretrained)
        )
        print(f"[Model Loader] Khởi tạo MobileCLIP: {name} trên {device}")
        return MobileCLIP(model_name=name, pretrained=weights, device=device)

    elif m_type in ["siglip2", "siglip2_model"]:
        siglip_cfg = cfg.get_model("siglip2")
        name = model_name or siglip_cfg.model_name

        offline_siglip = Path(
            "outputs/models/siglip2/models--timm--ViT-B-16-SigLIP2/snapshots/eee10eff6dd8cabae2d7f379d4e8cfcd352030aa/open_clip_model.safetensors"
        )
        fallback_clip = Path(
            "outputs/models/mobile_clip/models--timm--ViT-B-16-SigLIP2/snapshots/eee10eff6dd8cabae2d7f379d4e8cfcd352030aa/open_clip_model.safetensors"
        )

        weights = pretrained or siglip_cfg.pretrained
        if offline_siglip.exists() and not pretrained:
            weights = str(offline_siglip)
        elif fallback_clip.exists() and not pretrained:
            weights = str(fallback_clip)

        print(
            f"[Model Loader] Khởi tạo SigLIP2: {name} (weights: {weights}) trên {device}"
        )
        return Siglip2Model(model_name=name, pretrained=weights, device=device)

    else:
        raise ValueError(
            f"Không hỗ trợ model: {model_type}. Vui lòng chọn 'siglip2', 'clip' hoặc 'mobile_clip'."
        )


def list_keyframe_dirs(kf_root):
    # Lấy các thư mục con chứa ảnh hoặc chứa ts_ms.npy
    dirs = [Path(p).parent for p in sorted(glob.glob(os.path.join(kf_root, "*", "ts_ms.npy")))]
    if not dirs:
        dirs = [p for p in sorted(Path(kf_root).iterdir()) if p.is_dir()]
    return dirs


def load_frames(vdir):
    files = sorted(glob.glob(os.path.join(vdir, "k_*.jpg")))
    if not files:
        files = sorted(glob.glob(os.path.join(vdir, "*.jpg"))) + sorted(glob.glob(os.path.join(vdir, "*.png")))
    
    if not files:
        return [], []

    ts_path = os.path.join(vdir, "ts_ms.npy")
    ts = None
    if os.path.exists(ts_path):
        try:
            ts = np.load(ts_path, allow_pickle=True)
        except Exception:
            ts = None

    if ts is None or len(ts) == 0:
        ts = np.arange(len(files)) * 1000

    n = min(len(files), len(ts))
    imgs, kept_ts = [], []
    for i in range(n):
        try:
            imgs.append(Image.open(files[i]).convert("RGB"))
            kept_ts.append(int(ts[i]))
        except Exception:
            continue

    return imgs, kept_ts


def process_single_video(
    vdir: Path, target_dir: Path, model, batch_size: int = 16
):
    vid = vdir.name
    out_npz = target_dir / f"{vid}.npz"

    if out_npz.exists():
        print(f"[Single] Đã tồn tại: {out_npz}")
        return out_npz

    imgs, kept_ts = load_frames(vdir)
    if not imgs:
        raise RuntimeError(f"Không tìm thấy ảnh hợp lệ: {vid}")

    emb = model.encode_images_batches(imgs, batch_size=batch_size)
    if hasattr(emb, "cpu"):
        emb = emb.cpu().numpy()

    np.savez(
        out_npz,
        embeddings=emb.astype(np.float16),
        ts_ms=np.asarray(kept_ts, dtype=np.int32),
    )
    print(f"[Single] Trích xuất thành công: {vid} -> {out_npz}")
    return out_npz


def main():
    ap = argparse.ArgumentParser(
        description="Trích xuất Vector Embeddings cho AIC Keyframes"
    )
    ap.add_argument(
        "--keyframes",
        required=True,
        help="Thư mục chứa keyframes (vd: outputs/keyframes)",
    )
    ap.add_argument(
        "--out",
        default="outputs/img_embddings",
        help="Thư mục gốc lưu embeddings",
    )
    ap.add_argument(
        "--model-type",
        default="siglip2",
        choices=["siglip2", "clip", "mobile_clip"],
        help="Loại mô hình trích xuất",
    )
    ap.add_argument(
        "--name",
        default=None,
        help="Tên model (vd: ViT-B-32 hoặc ViT-B-16-SigLIP2)",
    )
    ap.add_argument(
        "--pretrained", default=None, help="Tên tag pretrained checkpoint"
    )
    ap.add_argument(
        "--video-name",
        default="",
        help="Chạy riêng 1 video (vd: general_long_video_L21_V001)",
    )
    ap.add_argument("--device", default="mps")
    ap.add_argument(
        "--batch-size",
        type=int,
        default=16,
        help="Batch size",
    )
    ap.add_argument("--shard-index", type=int, default=0)
    ap.add_argument("--shard-count", type=int, default=1)
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    shard_dir = Path(args.out) / f"index_shards_{args.model_type}"
    shard_dir.mkdir(parents=True, exist_ok=True)

    model = load_model_from_args(
        model_type=args.model_type,
        device=args.device,
        model_name=args.name,
        pretrained=args.pretrained,
    )

    if args.video_name:
        target_vdir = Path(args.keyframes) / args.video_name
        if not target_vdir.exists():
            raise SystemExit(
                f"Không tìm thấy thư mục keyframe: {args.video_name}"
            )
        process_single_video(target_vdir, shard_dir, model, args.batch_size)
        return

    fail_log = (
        Path(args.out)
        / f"failed_embed_{args.model_type}_shard{args.shard_index}.txt"
    )
    vdirs = list_keyframe_dirs(args.keyframes)
    if not vdirs:
        raise SystemExit(f"Không tìm thấy keyframes trong {args.keyframes}")

    mine = [
        d
        for i, d in enumerate(vdirs)
        if i % args.shard_count == args.shard_index
    ]
    if args.limit:
        mine = mine[: args.limit]
    print(
        f"[{args.model_type} | shard {args.shard_index}/{args.shard_count}] Đang xử lý {len(mine)}/{len(vdirs)} videos",
        flush=True,
    )

    t0 = time.time()
    done = nframes = failed = 0
    for vdir in mine:
        vid = vdir.name
        out_npz = shard_dir / f"{vid}.npz"
        if out_npz.exists():
            done += 1
            continue
        try:
            imgs, kept_ts = load_frames(vdir)
            if not imgs:
                raise RuntimeError("No frames available")
            emb = model.encode_images_batches(imgs, batch_size=args.batch_size)
            if hasattr(emb, "cpu"):
                emb = emb.cpu().numpy()
            np.savez(
                out_npz,
                embeddings=emb.astype(np.float16),
                ts_ms=np.asarray(kept_ts, dtype=np.int32),
            )
            nframes += len(imgs)
        except Exception as ex:
            failed += 1
            with open(fail_log, "a", encoding="utf-8") as f:
                f.write(f"{vid}\t{ex}\n")
        done += 1
        if done % 5 == 0 or done == len(mine):
            el = time.time() - t0
            print(
                f"[{args.model_type}] Tiến độ: {done}/{len(mine)} | Frames: {nframes} | Lỗi: {failed} ({el:.1f}s)",
                flush=True,
            )
            
    print(
        f"[{args.model_type}] HOÀN THÀNH. Xử lý {done} videos, {nframes} frames trong {time.time()-t0:.0f}s",
        flush=True,
    )


if __name__ == "__main__":
    main()