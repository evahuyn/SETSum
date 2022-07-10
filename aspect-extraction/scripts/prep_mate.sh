#!/bin/bash

domain="$1"

python ./scripts/prep_hdf5.py \
    --w2v ./w2v/glove.6B.300d.txt \
    --name ./data/preprocessed/"$domain"_MATE \
    --data ./data/set_dataset/"$domain".trn \
    --lemmatize

python ./scripts/prep_hdf5_test.py \
    --data ./data/set_dataset/"$domain"-test.asp \
    --name ./data/preprocessed/"$domain"_MATE_TEST \
    --vocab ./data/preprocessed/"$domain"_MATE_word_mapping.txt \
    --products ./data/preprocessed/"$domain"_MATE_product_mapping.txt \
    --lemmatize

echo