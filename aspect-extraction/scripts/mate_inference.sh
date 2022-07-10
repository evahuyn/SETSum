#!/bin/bash

domain="$1"
file="$2"

python ./mate/mate_inference.py \
--model ./models/"$domain"/best_model.pth \
--data ./data/preprocessed/"$domain"_MATE \
--inference_data ./data/preprocessed/"$file"_MATE_ALL.hdf5 \
--aspect_seeds ./data/seeds_weight/"$domain".5-weights.txt \
--attention --fix_a_emb --fix_w_emb \
--out ./inference/"$file"_inference_all.txt