# root/utils.py
"""
Path controller utility file for the MultiModal-RAG project.
Manages the project root path and standardized output directories.
"""
import os
import sys
import glob
from pathlib import Path

# Determine the absolute path to the project root directory
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

def get_project_root() -> Path:
    """
    Return the absolute Path object pointing to the project root directory.

    Returns:
        Path: The absolute path of the project root.
    """
    return ROOT_DIR

def get_output_dir(sub_folder: str = "") -> Path:
    """
    Manage and return the absolute Path to the outputs directory or its subfolder.
    Automatically creates the target directory if it does not already exist.

    Args:
        sub_folder (str): Optional subfolder name inside the 'outputs' directory.

    Returns:
        Path: The absolute path of the target output directory.
    """
    out_dir = ROOT_DIR / "outputs"
    if sub_folder:
        out_dir = out_dir / sub_folder
    out_dir.mkdir(parents=True, exist_ok=True)
    return out_dir

def coll_from_path(path: str) -> str:
    """
    Extract a normalized collection name from a given video file path.
    """
    path_obj = Path(path).resolve()
    up = str(path_obj).upper()

    for c in ("V3C1", "V3C2"):
        if c in up:
            return c.lower()
    # get subfolder
    parent_folder = path_obj.parent.name.lower()
    return f"general_{parent_folder}"

def list_videos(roots: list[str]) -> list[tuple[str, str]]:
    """
    Recursively scan root directories to discover all MP4 video files,
    then generate their normalized unique video IDs and absolute paths.

    Args:
        roots (list[str]): A list of root directory paths to scan.

    Returns:
        list[tuple[str, str]]: A list of tuples containing (video_id, absolute_video_path).
    """
    vids = []
    for root in roots:
        pattern = os.path.join(root, "**", "*.mp4")
        for mp4 in sorted(glob.glob(pattern, recursive=True)):
            path_obj = Path(mp4).resolve()
            coll = coll_from_path(str(path_obj))
            video_id = f"{coll}_{path_obj.stem}"
            vids.append((video_id, str(path_obj)))
    return vids

def list_from_file(path: str) -> list[tuple[str, str]]:
    """
    Read a text file containing line-by-line video file paths,
    validate their existence, and generate normalized (video_id, absolute_path) tuples.

    Args:
        path (str): Path to the text file containing video paths.

    Returns:
        list[tuple[str, str]]: A list of tuples containing (video_id, absolute_video_path).
    """
    vids = []
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            mp4 = line.strip()
            if mp4 and os.path.isfile(mp4):
                path_obj = Path(mp4).resolve()
                coll = coll_from_path(str(path_obj))
                video_id = f"{coll}_{path_obj.stem}"
                vids.append((video_id, str(path_obj)))
    return vids

if __name__ == "__main__":
    root = get_project_root()
    print(f"Root: {root}")
    
    output = get_output_dir("data")
    print(f"Output: {output}")
    
    # Kiểm tra hàm quét video tự động từ thư mục mẫu
    test_roots = ["samples_data"]
    print("\n--- Testing list_videos ---")
    videos = list_videos(test_roots)
    if videos:
        for vid, path in videos[:5]:  # In ra tối đa 5 video đầu tiên
            print(f"ID: {vid} \n--> Path: {path}\n")
    else:
        print("No videos found. Check your 'samples_data' path.")
    