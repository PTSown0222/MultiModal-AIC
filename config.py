"""
CLI:
    uv run python config.py
REFERENCE:
    mobile_clip: https://github.com/apple/ml-mobileclip
    siglip2: https://colab.research.google.com/github/google-research/big_vision/blob/main/big_vision/configs/proj/image_text/SigLIP2_demo.ipynb#scrollTo=0DsOabGD7MRG
    eva: https://github.com/baaivision/EVA
"""
import torch
from dataclasses import dataclass, field

@dataclass
class BaseModelConfig:
    device: str = (
        "cuda" if torch.cuda.is_available() 
        else "mps" if torch.backends.mps.is_available() 
        else "cpu"
    )
    batch_size: int = 8

@dataclass
class MobileCLIPConfig(BaseModelConfig):
    model_name: str = "MobileCLIP2-S0"
    pretrained: str = "dfndr2b"
    #model_name: str = "MobileCLIP2-S4"
    #pretrained: str = "datacomp"
    image_size: int = 224

@dataclass
class SigLIP2Config(BaseModelConfig):
    model_name: str = "ViT-B-16-SigLIP2"
    pretrained: str = "webli"
    image_size: int = 224

@dataclass
class ClipConfig(BaseModelConfig):
    model_name: str = "ViT-B-32"
    pretrained: str = "laion2b_s34b_b79k"

@dataclass
class EvaClipConfig(BaseModelConfig):
    model_name: str = "EVA02-CLIP-B-16"
    pretrained: str = "merged2b_s8B_b131k"

# @dataclass
# class BClipConfig(BaseModelConfig):
#     model_name: str = ""
#     pretrained: str = ""

@dataclass
class MainConfig:
    # model
    mobile_clip: MobileCLIPConfig = field(default_factory=MobileCLIPConfig)
    siglip2: SigLIP2Config = field(default_factory=SigLIP2Config)
    clip: ClipConfig = field(default_factory=ClipConfig)
    evaclip: EvaClipConfig = field(default_factory=EvaClipConfig)

    # path
    video_dir: str = "./data/videos"
    db_path: str = "./data/vector_db"
    outputs_models: str = "./outputs/models"

    # support for retrieves
    output_support_paths: str = "./outputs"
    ocr_paths: str = ".outputs/ocr"

    # keyframe paths
    keyframe_path: str = "./outputs/keyframes"

    def get_model(self, model_type: str) -> BaseModelConfig:
        configs = {
            "mobile_clip": self.mobile_clip,
            "siglip2": self.siglip2,
            "clip": self.clip,
            "evaclip": self.evaclip,
        }

        if model_type not in configs:
            raise ValueError(f"Not ready for your models. Please choose from the list: {list(configs.keys())}")
        return configs[model_type]

if __name__ == "__main__":
    # test config 
    cfg = MainConfig()
    
    print(f"[Device]: {cfg.clip.device}\n")
    models_to_test = ["mobile_clip", "siglip2", "clip", "evaclip"]
    
    for model_key in models_to_test:
        try:
            model_cfg = cfg.get_model(model_key)
            print(f" [Type]: {model_key:<12} | [name]: {model_cfg.model_name:<38} | [Batch Size]: {model_cfg.batch_size}")
        except Exception as e:
            print(f" [Errors] {model_key}: {e}")
    
    print("\nSystematic Errors:")
    try:
        cfg.get_model("Qwen-model")
    except ValueError as e:
        print(f"[Error]: {e}")

