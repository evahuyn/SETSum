import pandas as pd
import numpy as np
import tensorflow as tf
import torch
from torch.nn import BCEWithLogitsLoss, BCELoss
from torch.utils.data import TensorDataset, DataLoader, RandomSampler, SequentialSampler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, multilabel_confusion_matrix, f1_score, accuracy_score
from transformers import RobertaTokenizer, RobertaForCausalLM, RobertaConfig, AdamW, get_linear_schedule_with_warmup, RobertaForSequenceClassification
from tqdm import tqdm, trange

# some codes are brought from: https://colab.research.google.com/github/rap12391/transformers_multilabel_toxic/blob/master/toxic_multilabel.ipynb#scrollTo=aiBeiBSRoOuz

device_name = tf.test.gpu_device_name()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
n_gpu = torch.cuda.device_count()
torch.cuda.get_device_name(0)

df = pd.read_csv('input file', encoding_errors="ignore")
cols = df.columns
df = df.sample(frac=1).reset_index(drop=True) #shuffle rows

print("dataframe", df.head())
labels_str = list(df.label.values)
labels = list()
num_labels = 0
for e in labels_str:
    label = [int(float(item)) for item in e.split("[")[1].split("]")[0].split(",")]
    num_labels = len(label)
    labels.append(label)
comments = list(df.text.values)

max_length = 100
tokenizer = RobertaTokenizer.from_pretrained('roberta-base', do_lower_case=False)
encodings = tokenizer.batch_encode_plus(comments,max_length=max_length,pad_to_max_length=True, return_token_type_ids=True) # tokenizer's encoding method
print('tokenizer outputs: ', encodings.keys())

input_ids = encodings['input_ids'] # tokenized and encoded sentences
token_type_ids = encodings['token_type_ids'] # token type ids
attention_masks = encodings['attention_mask'] # attention masks


train_inputs, validation_inputs, train_labels, validation_labels, train_token_types, validation_token_types, train_masks, validation_masks = train_test_split(input_ids, labels, token_type_ids, attention_masks,
                                                            random_state=2020, test_size=0.5)

# Convert all of our data into torch tensors, the required datatype for our model
train_inputs = torch.tensor(train_inputs)
train_labels = torch.tensor(train_labels)
train_masks = torch.tensor(train_masks)
train_token_types = torch.tensor(train_token_types)

validation_inputs = torch.tensor(validation_inputs)
validation_labels = torch.tensor(validation_labels)
validation_masks = torch.tensor(validation_masks)
validation_token_types = torch.tensor(validation_token_types)

batch_size = 16

train_data = TensorDataset(train_inputs, train_masks, train_labels, train_token_types)
train_sampler = RandomSampler(train_data)
train_dataloader = DataLoader(train_data, sampler=train_sampler, batch_size=batch_size)

validation_data = TensorDataset(validation_inputs, validation_masks, validation_labels, validation_token_types)
validation_sampler = SequentialSampler(validation_data)
validation_dataloader = DataLoader(validation_data, sampler=validation_sampler, batch_size=batch_size)

torch.save(validation_dataloader,'validation_data_loader')
torch.save(train_dataloader,'train_data_loader')

# Load Model
model = RobertaForSequenceClassification.from_pretrained('roberta-base', num_labels=num_labels)
model.cuda()

# setting custom optimization parameters.
param_optimizer = list(model.named_parameters())
no_decay = ['bias', 'gamma', 'beta']
optimizer_grouped_parameters = [
    {'params': [p for n, p in param_optimizer if not any(nd in n for nd in no_decay)],
     'weight_decay_rate': 0.01},
    {'params': [p for n, p in param_optimizer if any(nd in n for nd in no_decay)],
     'weight_decay_rate': 0.0}
]

optimizer = AdamW(optimizer_grouped_parameters,lr=2e-5,correct_bias=True)
# optimizer = AdamW(model.parameters(),lr=2e-5)  # Default optimization

# Train model
train_loss_set = []

# Number of training epochs (authors recommend between 2 and 4)
epochs = 50

# trange is a tqdm wrapper around the normal python range
for _ in trange(epochs, desc="Epoch"):

    # Training
    model.train()

    tr_loss = 0  # running loss
    nb_tr_examples, nb_tr_steps = 0, 0

    for step, batch in enumerate(train_dataloader):
        batch = tuple(t.to(device) for t in batch)
        b_input_ids, b_input_mask, b_labels, b_token_types = batch
        optimizer.zero_grad()

        # Forward pass for multilabel classification
        outputs = model(b_input_ids, token_type_ids=None, attention_mask=b_input_mask)
        logits = outputs[0]
        loss_func = BCEWithLogitsLoss()
        loss = loss_func(logits.view(-1, num_labels),
                         b_labels.type_as(logits).view(-1, num_labels))  # convert labels to float for calculation
        train_loss_set.append(loss.item())

        # Backward pass
        loss.backward()
        # Update parameters and take a step using the computed gradient
        optimizer.step()

        tr_loss += loss.item()
        nb_tr_examples += b_input_ids.size(0)
        nb_tr_steps += 1

    print("Train loss: {}".format(tr_loss / nb_tr_steps))

    ###############################################################################

    # Validation

    # Put model in evaluation mode to evaluate loss on the validation set
    model.eval()

    # Variables to gather full output
    logit_preds, true_labels, pred_labels, tokenized_texts = [], [], [], []

    # Predict
    for i, batch in enumerate(validation_dataloader):
        batch = tuple(t.to(device) for t in batch)
        # Unpack the inputs from our dataloader
        b_input_ids, b_input_mask, b_labels, b_token_types = batch
        with torch.no_grad():
            # Forward pass
            outs = model(b_input_ids, token_type_ids=None, attention_mask=b_input_mask)
            b_logit_pred = outs[0]
            pred_label = torch.sigmoid(b_logit_pred)

            b_logit_pred = b_logit_pred.detach().cpu().numpy()
            pred_label = pred_label.to('cpu').numpy()
            b_labels = b_labels.to('cpu').numpy()

        tokenized_texts.append(b_input_ids)
        logit_preds.append(b_logit_pred)
        true_labels.append(b_labels)
        pred_labels.append(pred_label)

    # Flatten outputs
    pred_labels = [item for sublist in pred_labels for item in sublist]
    true_labels = [item for sublist in true_labels for item in sublist]

    # Calculate Accuracy
    true_bools = [tl == 1 for tl in true_labels]

    macro_thresholds = np.array(range(1, 10)) / 10
    f1_results = []
    for th in macro_thresholds:
        pred_bools = [pl > th for pl in pred_labels]
        test_f1_accuracy = f1_score(true_bools, pred_bools, average='micro')
        f1_results.append(test_f1_accuracy)

    best_macro_th = macro_thresholds[np.argmax(f1_results)]  # best macro threshold value

    micro_thresholds = (np.array(range(10)) / 100) + best_macro_th  # calculating micro threshold values

    f1_results = []
    for th in micro_thresholds:
        pred_bools = [pl > th for pl in pred_labels]
        test_f1_accuracy = f1_score(true_bools, pred_bools, average='micro')
        f1_results.append(test_f1_accuracy)

    best_f1_idx = np.argmax(f1_results)  # best threshold value

    # Printing and saving classification report
    print('Best Threshold: ', micro_thresholds[best_f1_idx])
    print('Validation F1 Accuracy: ', f1_results[best_f1_idx])

torch.save(model.state_dict(), 'roberta_model')