#!/bin/bash

# general config
export ROOT=/path/to/data
export KF=artifacts/keyframes
export OUT=artifacts/index
export DEV=cuda:0
export SHARDS=6

echo "--- Starting Processing ---"

# Extract key frames
for i in $(seq 0 $((SHARDS-1))); do
  python extract_keyframes.py --dataset-root $ROOT --out $KF --shard-index $i --shard-count $SHARDS &
done; wait

# Embedding 
MODEL="ViT-B-32"
PRETRAINED="laion2b_s34b_b79k"

for i in $(seq 0 $((SHARDS-1))); do
  CUDA_VISIBLE_DEVICES=0 python extract_embed.py \
    --keyframes $KF --out $OUT --device $DEV \
    --model $MODEL --pretrained $PRETRAINED \
    --shard-index $i --shard-count $SHARDS &
done; wait

echo "--- DONE INDEXING ---"