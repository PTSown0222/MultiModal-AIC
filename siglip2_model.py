
from __future__ import annotations
import numpy as np
import torch
from transformers import AutoProcessor, AutoModel

class Siglip2Model:
    def __init__(self, model_name="google/siglip2-base-patch16-224", device=None):
        # Tắt cuDNN giống như cách bạn làm với ViT-B-32
        torch.backends.cudnn.enabled = False
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        
        # Dùng AutoProcessor của transformers thay cho open_clip transforms
        self.processor = AutoProcessor.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name).to(self.device).eval()
        
        # Lấy kích thước vector đầu ra
        self.dim = self.model.config.text_config.hidden_size

    def encode_images(self, pil_images: list, batch_size=64) -> np.ndarray:
        feats = []
        for i in range(0, len(pil_images), batch_size):
            batch = pil_images[i:i + batch_size]
            
            # Preprocess ảnh chuẩn theo model SigLIP 2
            inputs = self.processor(images=batch, return_tensors="pt").to(self.device)
            
            with torch.no_grad():
                f = self.model.get_image_features(**inputs)
                # Giữ nguyên chuẩn hóa L2
                f = f / f.norm(dim=-1, keepdim=True)
                feats.append(f.float().cpu().numpy().astype(np.float16))
                
        return np.concatenate(feats, 0) if feats else np.zeros((0, self.dim), np.float16)

    def encode_texts(self, texts: list[str], batch_size=256) -> np.ndarray:
        feats = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            # SigLIP 2 khuyến cáo cứng padding="max_length" và max_length=64
            inputs = self.processor(
                text=batch, 
                padding="max_length", 
                max_length=64, 
                truncation=True, 
                return_tensors="pt"
            ).to(self.device)
            
            with torch.no_grad():
                f = self.model.get_text_features(**inputs)
                # Giữ nguyên chuẩn hóa L2
                f = f / f.norm(dim=-1, keepdim=True)
                feats.append(f.float().cpu().numpy().astype(np.float32))
                
        return np.concatenate(feats, 0) if feats else np.zeros((0, self.dim), np.float32)
        