#!/bin/bash

domain="$1"
threshold="$2"

echo "Model "$domain" with threshold "$threshold""

python ./mate/evaluate.py \
--gt_data ./data/gtlabels/"$domain".txt \
--predict_data ./inference/"$domain"_inference.txt \
--threshold "$2"

echo
