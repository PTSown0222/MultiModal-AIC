from dataclasses import dataclass
from pathlib import Path

@dataclass
class ConfigModel:
    siglip_model: str = "google/siglip2-base-patch16-224"
    clip_model: str = "ViT-B-32"

    # configuration root for all projects
    root = Path(__file__).resolve().parent

    