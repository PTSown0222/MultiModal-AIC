#!/bin/bash

INPUT_DIR="/Users/theson/Documents/MultiModal-RAG-AIC/keyframes"
OUTPUT_DIR="./output/ocr/"

# run extract
uv run python -m support_model.extract_ocr \
    --input_folder "$INPUT_DIR" \
    --output_folder "$OUTPUT_DIR"