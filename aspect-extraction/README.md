# Aspect Extraction

The code is modified from MultiSeed Aspect Extractor (Angelidis & Lapata, 2018). See their original code: https://github.com/stangelid/oposum. 

## Prerequisites
```
pip install -r requirements.txt
```

## Preprocessing of Data
Preprocess annotated data to match the format. Data files are put under "./data/set_dataset". We provide sample training and testing data as following.

- sample.trn
- sample-test.asp

## Extract Seed Words

*Note: In our real data, [domain] includes {course, instructor}. Here we use {sample} for demonstration.

Run the followinng command to automatically extract seed words

```commandline
sh ./scripts/run_seeds.sh [source folder] [output folder]
```

#### To obtain the keywords file and manual selection

```
python ./term_weights.py "$datadir"/"$domain"-test.asp --outdir "$outdir"/"$domain" -s -l
```
We combined automatic extraction of seed words with manual selection, and our resulted seed word list with normalized weights can be found in "./data/seed_weight/sample.5-weights.txt". It includes 5 seed words for 15 aspects.

### Prepare Data for MATE

Transfer data to hdf5 format to run MATE. Need to first download [Glove](https://nlp.stanford.edu/projects/glove/) Embedding, put the file under "./data/w2v". For example, we have "./data/w2v/glove.6B.300d.txt".

```commandline
sh ./scripts/prep_mate.sh [domain]
# example: sh ./scripts/prep_mate.sh sample
```

### Train the model

```commandline
sh ./scripts/run_mate.sh [domain]
# example: sh ./scripts/run_mate.sh sample
```

### Evaluate the model

Save ground truth labels to files for evaluation

```commandline
python ./scripts/read_hdf5_file.py --file ./data/preprocessed/[domain]_MATE_TEST.hdf5 --out [domain]
```

Evaluate with f1 score and accuracy

```commandline
sh ./scripts/evaluate_mate.sh [domain] [threshold]
```

### Inference using the model

Preprocess file to hdf5 for inference

```commandline
sh ./scripts/prep_mate_inference.sh [file name]
```

Make Inference with best model

```commandline
sh ./scripts/mate_inference.sh [domain] [file name]
# example: sh ./scripts/mate_inference.sh sample  test1
```

