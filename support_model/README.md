## Ideas of CropBounding Box to OCR texts: Spatial-Semantic Binding

Object Detection -> Bounding Box Crop -> OCR

Object Detection: YOLOv10 or YOLO11 (Fast): Identify global/general objects in frames
if these objects have texts --> PaddleOCR --> extract text

--> Concatenate in objects: {bounding boxs}, {texts in frames}

## Run extrac ocr

```shell
bash support_model/run.sh
```

