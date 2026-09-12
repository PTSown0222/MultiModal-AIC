#!/bin/bash

# extract ocr
INPUT_DIR="$HOME/Documents/MultiModal-RAG-AIC/keyframes"
OUTPUT_DIR="./output/ocr/"

# scene
INPUT_SCENCE_DIR=""
OUTPUT_ASR=""

# query
INPUT_QUERY="$HOME/Documents/MultiModal-RAG-AIC/public_round_tasks.jsonl"
OUTPUT_QUERY_DIR="./output/text_metadata"

# [1] --- run extract ocr
uv run python -m support_model.extract_ocr \
    --input_folder "$INPUT_DIR" \
    --output_folder "$OUTPUT_DIR"

# [2] --- run extract asr
if [ -n "$INPUT_SCENCE_DIR" ] && [ -n "$OUTPUT_ASR" ]; then
  uv run python -m support_model.extract_asr \
    --scenes_folder "$INPUT_SCENCE_DIR" \
    --output_asr "$OUTPUT_ASR"
fi

# [3] --- Decompose Query
uv run python -m support_model.query_decomposer.py \
    --tasks_root "$INPUT_QUERY" \
    --output_quer "$OUTPUT_QUERY_DIR" 