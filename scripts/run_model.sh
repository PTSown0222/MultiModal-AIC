#!/bin/bash

MODEL_NAME=${1:-"mobile_clip"}
MODEL_VERSION=${2:-"MobileCLIP2-S0"}
PRETRAINED_TAG=${3:-"dfndr2b"}

echo "----------------------------------------"
echo "Running test model..."
echo "Model: $MODEL_NAME | Name: $MODEL_VERSION | Pretrained: $PRETRAINED_TAG"
echo "----------------------------------------"

uv run python -m models.run --model "$MODEL_NAME" --name "$MODEL_VERSION" --pretrained "$PRETRAINED_TAG"

echo "run test model"
uv run python -m models.run