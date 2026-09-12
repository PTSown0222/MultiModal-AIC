#!/bin/bash

set -e

if [ $# -eq 0 ]; then
    echo "=== Running default extraction with 3 samples limit ==="
    uv run python -m keyframes_selection.extract_keyframes \
        --dataset-root samples_data \
        --limit 5
else
    echo "=== Running keyframe extraction with custom arguments: $@ ==="
    uv run python -m keyframes_selection.extract_keyframes "$@"
fi