import logging
import os
import random
from dataclasses import dataclass

from PIL import Image
from torch.utils.data import Dataset, DataLoader
from torch.utils.data.distributed import DistributedSampler

import csv
from tqdm import tqdm

import json
from decord import VideoReader, cpu
import numpy as np
import torch
import utils
import time
import pandas as pd
import sys
from glob import glob
import cv2

def resize_frames(frames, target_height, target_width):
    if frames.shape[1] == target_height and frames.shape[2] == target_width:
        return frames
    
    resized_frames = np.zeros((frames.shape[0], target_height, target_width, frames.shape[3]), dtype=frames.dtype)
    for i in range(frames.shape[0]):
        resized_frames[i] = cv2.resize(frames[i], (target_width, target_height))
    return resized_frames


def load_video_inter(video_path, pos_window=None, clip_frames=16, target_height=None, target_width=None):
    vr = VideoReader(video_path, ctx=cpu(0))
    total_frame_num = len(vr)
    if pos_window:
        start, end = int(pos_window[0]), int(pos_window[1])
        uniform_sampled_frames = np.linspace(start, end, clip_frames, dtype=int)
    else:
        uniform_sampled_frames = np.linspace(0, total_frame_num-1, clip_frames, dtype=int)
    frame_idx = uniform_sampled_frames.tolist()
    video = vr.get_batch(frame_idx).asnumpy()
    vr.seek(0)
    
    if target_height is not None and target_width is not None:
        video = resize_frames(video, target_height, target_width)
    
    return video

def load_video_intra(video_path, pos_window, clip_frames=16, neg_frames=100):
    vr = VideoReader(video_path, ctx=cpu(0))
    total_frame_num = len(vr)
    vr_fps = vr.get_avg_fps()
    video_time = total_frame_num / vr_fps

    pos_start, pos_end = int(pos_window[0]), int(pos_window[1])
    pos_end = min(pos_end, total_frame_num-1)
    uniform_sampled_frames = np.linspace(pos_start, pos_end, clip_frames, dtype=int)
    pos_frame_idxs = uniform_sampled_frames.tolist()

    neg_candidates = [i for i in range(total_frame_num) if i not in pos_frame_idxs]
    neg_frame_idxs = random.sample(neg_candidates, neg_frames)

    selected_frame_idxs = pos_frame_idxs + neg_frame_idxs
    selected_frame_idxs = sorted(selected_frame_idxs)

    sample_frames = neg_frames+clip_frames
    labels = torch.zeros(sample_frames, dtype=torch.bool)
    for i, frm_idx in enumerate(selected_frame_idxs):
        if frm_idx in pos_frame_idxs:
            labels[i] = 1

    frames = vr.get_batch(selected_frame_idxs).asnumpy() 
    vr.seek(0)
    return frames, selected_frame_idxs, video_time, labels