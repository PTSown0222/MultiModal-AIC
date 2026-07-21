"""
Enrich shots with PaddleOCR and Yolo10
"""
# Cài đặt: pip install ultralytics paddlepaddle-gpu paddleocr
import cv2
from ultralytics import YOLO
from paddleocr import PaddleOCR

class SpatialOCRDetector:
    def __init__(self, yolo_model="yolov10s.pt", device="cuda"):
        # Load mô hình YOLO (có thể thay bằng Florence-2/Grounding DINO nếu cần)
        self.detector = YOLO(yolo_model)
        # Load PaddleOCR (chỉ dùng tiếng Anh cho text trên áo/bảng hiệu, hoặc thêm 'vi')
        self.ocr = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=(device=="cuda"), show_log=False)
        
    def process_frame(self, image_path):
        img = cv2.imread(image_path)
        if img is None: return []

        # 1. Chạy Object Detection
        results = self.detector(img, verbose=False)
        annotated_objects = []

        for box in results[0].boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            class_name = self.detector.names[cls_id]

            # Bộ lọc: Chỉ OCR trên những vật thể tiềm năng chứa chữ (người, hộp, bảng báo, xe cộ)
            target_classes = ["person", "bottle", "box", "car", "bus", "truck", "sign"]
            if class_name not in target_classes:
                continue

            # 2. Crop Bounding Box (Thêm padding để OCR không bị cắt lẹm chữ)
            pad = 5
            h, w, _ = img.shape
            c_y1, c_y2 = max(0, y1-pad), min(h, y2+pad)
            c_x1, c_x2 = max(0, x1-pad), min(w, x2+pad)
            cropped_img = img[c_y1:c_y2, c_x1:c_x2]

            # Skip nếu crop quá nhỏ
            if cropped_img.shape[0] < 10 or cropped_img.shape[1] < 10:
                continue

            # 3. Phóng to ảnh (Upscale) để OCR đọc chữ nhỏ trên áo tốt hơn
            cropped_img = cv2.resize(cropped_img, (0,0), fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)

            # 4. Chạy OCR bên trong Box
            ocr_result = self.ocr.ocr(cropped_img, cls=True)
            extracted_text = []
            
            if ocr_result and ocr_result[0]:
                for line in ocr_result[0]:
                    text, text_conf = line[1][0], line[1][1]
                    if text_conf > 0.6: # Ngưỡng tin cậy của OCR
                        extracted_text.append(text)

            if extracted_text:
                full_text = " ".join(extracted_text)
                # Gắn nhãn ngữ nghĩa siêu mạnh
                semantic_label = f"A {class_name} with text '{full_text}'"
                annotated_objects.append({
                    "object": class_name,
                    "bbox": [x1, y1, x2, y2],
                    "embedded_text": full_text,
                    "semantic_caption": semantic_label
                })

        return annotated_objects

# Cách sử dụng
# pipeline = SpatialOCRDetector()
# metadata = pipeline.process_frame("baseline_key_frames/v3c1_00001/k_00001.jpg")
# print(metadata)
# Output mong đợi: [{'object': 'person', 'bbox': [100, 50, 300, 400], 'embedded_text': 'NIKE', 'semantic_caption': "A person with text 'NIKE'"}]