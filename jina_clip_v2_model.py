"""
Use VLMs Encoder: JinaClip-v2 with Huggingface
"""

from __future__ import annotations
from pathlib import Path
from typing import Iterable
import numpy as np
import torch
from transformers import AutoModel
s

class JinaClipModel:
    def __init__(self, model_name="jinaai/jina-clip-v2", device=None, truncate_dim=1024):
        torch.backends.cudnn.enabled = False 
        
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        
        self.model = AutoModel.from_pretrained(model_name, trust_remote_code=True)
        self.model = self.model.to(self.device).eval()
        
        self.truncate_dim = truncate_dim
        self.dim = truncate_dim

    def encode_images(self, pil_images: list, batch_size=64) -> np.ndarray:
        feats = []
        for i in range(0, len(pil_images), batch_size):
            batch = pil_images[i:i + batch_size]
            with torch.no_grad():
                f = self.model.encode_image(batch, truncate_dim=self.truncate_dim)
                if isinstance(f, torch.Tensor):
                    f = f.float().cpu().numpy()
                feats.append(f.astype(np.float16))
                
        return np.concatenate(feats, 0) if feats else np.zeros((0, self.dim), np.float16)

    def encode_texts(self, texts: list[str], batch_size=256) -> np.ndarray:
        feats = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            with torch.no_grad():
                f = self.model.encode_text(batch, truncate_dim=self.truncate_dim)
                
                if isinstance(f, torch.Tensor):
                    f = f.float().cpu().numpy()
                feats.append(f.astype(np.float32))
                
        return np.concatenate(feats, 0) if feats else np.zeros((0, self.dim), np.float32)

