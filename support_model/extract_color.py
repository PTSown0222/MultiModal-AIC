import cv2
import numpy as np
from ultralytics import YOLO
from sklearn.cluster import KMeans

def load_model(model_name = "yolov8"):
    model = YOLO("yolov8n.pt") 