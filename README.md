# Informative Video Retrivals

## Decompose The Bricks into Pieces

### Stage 1: Adjust Frame Extraction Methods
1. [ ] Shot Detection and Adaptive Sampling --> Select important frames (static only get 1 frame to motion frame (catch it))
2. [ ] Anotation and Captioning: Use a LLMs to caption a frame into metadata 
3. [ ] Anotation with Paddle OCR and Object Detection (Yolo10)

```python
{
        "shot_id": 1,
        "start_ms": 1200,    // Thời điểm bắt đầu shot
        "end_ms": 3500,      // Thời điểm kết thúc shot
        "representative_frame": "k_00001.jpg", 
        "duration_ms": 2300,
        "ocr_text": "",      // Để dành cho bước OCR
        "objects": []        // Để dành cho bước Object Detection
}
```

### Stage 2: Select Embedding Models
1. [ ] Baseline: CLIP Model -> Vision Encoder + Text Encoder

## System Design

Inputs --> SBD + Adaptive Sampling
Advanced 

## How to Run

```shell
ROOT="./SUB_DATA_10CLIP_TEST"; DEV=mps
KF=keyframes        

# 1. Extract I-frames once (no GPU; shard across processes; resumable).
for i in 0 1 2 3 4 5; do
  uv run extract_keyframes.py \
    --dataset-root "$ROOT/V3C1" --dataset-root "$ROOT/V3C2" \
    --out "$KF" --shard-index $i --shard-count 6 &
done

# 2. Embed the saved keyframes (GPU; resumable). Re-run with any encoder — no re-decode.
for i in 0 1 2 3 4 5; do
  CUDA_DEVICE_ORDER=PCI_BUS_ID CUDA_VISIBLE_DEVICES=0 \
  uv run extract_embed.py \
    --keyframes $KF --out artifacts/index --device $DEV \
    --model ViT-B-32 --pretrained laion2b_s34b_b79k \
    --shard-index $i --shard-count 6 &
done; wait

# 3. Retrieve -> submission.json (one frame_ms per prediction)
#CUDA_DEVICE_ORDER=PCI_BUS_ID CUDA_VISIBLE_DEVICES=<gpu> \
uv run retrive.py \
 --shard artifacts/index/shards \
 --tasks public_round_tasks.jsonl \
 --out submission.json \
 --model ViT-B-32 --pretrained laion2b_s34b_b79k --device $DEV

# 4. Score against ground truth
uv run python score.py --submission submission.json \
  --ground-truth gt_public_round.jsonl
```

#### Model cache at: /Users/theson/.cache/huggingface/hub/

Check list models: ls -lh ~/.cache/huggingface/hub/

Check volume weight: du -sh ~/.cache/huggingface/hub/

delete weight: rm -rf ~/.cache/huggingface/hub/*

####
```shell
requirements:
easyocr>=1.7.1
```