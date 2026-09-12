#!/bin/bash

set -e

export KF="outputs/keyframes"
export OUT="img_embddings"
export MODEL="MobileCLIP2-S0"
export DEVICE="mps"
export TOTAL_SHARDS=6

echo "--- Starting Parallel Batch Pipeline (3 shards concurrently) ---"

# --- ĐỢT 1: Chạy song song Shards 0, 1, 2 ---
echo "=== Phase 1: Keyframe Extraction (Shards 0-2 in parallel) ==="
for i in 0 1 2; do
  uv run python -m keyframes_selection.extract_keyframes \
    --dataset-root samples_data \
    --out "$KF" \
    --shard-index "$i" \
    --shard-count "$TOTAL_SHARDS" &
done
wait

echo "=== Phase 1: Embedding Extraction (Shards 0-2 in parallel) ==="
for i in 0 1 2; do
  uv run python -m keyframes_selection.extract_embedding \
    --keyframes "$KF" \
    --out "$OUT" \
    --model "$MODEL" \
    --device "$DEVICE" \
    --shard-index "$i" \
    --shard-count "$TOTAL_SHARDS" &
done
wait

echo "=== Phase 2: Keyframe Extraction (Shards 3-5 in parallel) ==="
for i in 3 4 5; do
  uv run python -m keyframes_selection.extract_keyframes \
    --dataset-root samples_data \
    --out "$KF" \
    --shard-index "$i" \
    --shard-count "$TOTAL_SHARDS" &
done
wait

echo "=== Phase 2: Embedding Extraction (Shards 3-5 in parallel) ==="
for i in 3 4 5; do
  uv run python -m keyframes_selection.extract_embedding \
    --keyframes "$KF" \
    --out "$OUT" \
    --model "$MODEL" \
    --device "$DEVICE" \
    --shard-index "$i" \
    --shard-count "$TOTAL_SHARDS" &
done
wait

echo "--- DONE ALL SHARDS IN PARALLEL BATCHES ---"