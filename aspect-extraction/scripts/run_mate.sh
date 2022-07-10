#!/bin/bash

domain="$1"

python ./mate/mate.py \
./data/preprocessed/"$domain"_MATE \
--test_data ./data/preprocessed/"$domain"_MATE_TEST.hdf5 \
--aspect_seeds ./data/seeds_weight/"$domain".5-weights.txt --epochs 10 \
--savemodel ./ --semeval ./evaluate.txt --sumout ./output.txt \
--attention --fix_a_emb --fix_w_emb

echo