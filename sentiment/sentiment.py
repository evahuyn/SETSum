import os
import json
import torch
import random
import numpy as np
from tqdm import tqdm, trange


def sentiment_analysis_data():
    from torch.utils.data import TensorDataset
    os.environ['TRANSFORMERS_CACHE'] = 'train/cache'
    from transformers import AutoTokenizer
    tokenizer = AutoTokenizer.from_pretrained("roberta-large")
    max_length = 400

    for data_set in ["course", "instructor"]:
        with open(f"data/{data_set}.txt", 'r') as f:
            lines = f.readlines()
        train_num = int(len(lines) * 0.9)
        train, dev = lines[:train_num], lines[train_num:]
        print(len(train), len(dev))

        for data_set_split, lines in [("train", train), ("dev", dev)]:
            input_ids, token_type_ids, attention_mask, label, id, sys = [], [], [], [], [], []
            index = 0
            for line in tqdm(lines):
                text, star = line.strip().split('\t')
                tokenized_input_seq_pair = tokenizer.encode_plus(text,
                                                                 max_length=max_length,
                                                                 return_token_type_ids=True, truncation=True)
                pad_length = max_length - len(tokenized_input_seq_pair['input_ids'])
                input_ids.append(tokenized_input_seq_pair['input_ids'] + [tokenizer.pad_token_id] * pad_length)
                token_type_ids.append(tokenized_input_seq_pair['token_type_ids'] + [0] * pad_length)
                attention_mask.append(tokenized_input_seq_pair['attention_mask'] + [0] * pad_length)
                label.append(1 if float(star) >= 4.0 else 0)  # positive=1, negative=0
                id.append(index)
                index += 1
            input_ids = torch.Tensor(input_ids).long()
            token_type_ids = torch.Tensor(token_type_ids).long()
            attention_mask = torch.Tensor(attention_mask).long()
            labels = torch.Tensor(label).long()
            ids = torch.Tensor(id).long()
            print(input_ids.size())
            dataset = TensorDataset(input_ids, token_type_ids, attention_mask, labels, ids)
            torch.save({"dataset": dataset}, f"data/{data_set}_{data_set_split}.pt")


def set_seed(seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def metrics(gt_dict, pred_dict):
    correct = 0
    tp, p, t = 0, 0, 0
    fn, n, f = 0, 0, 0
    for key in gt_dict:
        label = gt_dict[key]
        pred_label = pred_dict[key]
        p += pred_label
        t += label
        tp += pred_label * label
        n += 1 - pred_label
        f += 1 - label
        fn += (1 - pred_label) * (1 - label)
        correct += int(pred_label == label)
    if tp == 0:
        prec_pos, recall_pos, f1_pos = 0., 0., 0.
    else:
        prec_pos = tp / p
        recall_pos = tp / t
        f1_pos = (2 * prec_pos * recall_pos) / (prec_pos + recall_pos)
    if fn == 0:
        prec_neg, recall_neg, f1_neg = 0., 0., 0.
    else:
        prec_neg = fn / n
        recall_neg = fn / f
        f1_neg = (2 * prec_neg * recall_neg) / (prec_neg + recall_neg)

    macro_prec = (prec_pos + prec_neg) / 2
    macro_recall = (recall_pos + recall_neg) / 2
    macro_f1 = (2 * macro_prec * macro_recall) / (macro_prec + macro_recall) if (macro_prec + macro_recall) > 0. else 0.

    micro_prec = (tp + fn) / (p + n)
    micro_recall = (tp + fn) / (t + f)
    micro_f1 = (2 * micro_prec * micro_recall) / (micro_prec + micro_recall) if (micro_prec + micro_recall) > 0. else 0.
    return {'accuracy': correct / len(gt_dict), 'f1_pos': f1_pos, "f1_neg": f1_neg,
            "macro_f1": macro_f1, "micro_f1": micro_f1}


def sentiment_analysis():
    from torch.utils.data import DataLoader, RandomSampler, SequentialSampler
    os.environ['TRANSFORMERS_CACHE'] = 'train/cache'
    from transformers import AutoModelForSequenceClassification
    batch_size = 2
    eval_batch_size = 8
    gradient_accumulation_steps = 8
    from transformers import AdamW, get_linear_schedule_with_warmup
    lr = 1e-5
    seed = 42
    epoch = 5

    for data_set in ["course", "instructor"]:
        model = AutoModelForSequenceClassification.from_pretrained("roberta-large", cache_dir="train/cache").cuda()
        train_dataset = torch.load(f"data/{data_set}_train.pt")["dataset"]
        train_sampler = RandomSampler(train_dataset)
        optimizer_grouped_parameters = [{"params": [p for n, p in model.named_parameters()],},]
        optimizer = AdamW(optimizer_grouped_parameters, lr=lr, eps=1e-8)
        train_dataloader = DataLoader(train_dataset, sampler=train_sampler, batch_size=batch_size)
        t_total = len(train_dataloader) // gradient_accumulation_steps * epoch
        scheduler = get_linear_schedule_with_warmup(
            optimizer, num_warmup_steps=len(train_dataloader) // gradient_accumulation_steps, num_training_steps=t_total
        )
        model.zero_grad()
        train_iterator = trange(0, epoch, desc="Epoch")
        set_seed(seed)  # Added here for reproductibility
        best_micro_f1, best_model = 0, None
        for ep in train_iterator:
            model_dir = f"{data_set}_epoch{ep}"
            print(f"================ Epoch {ep} =================")
            epoch_iterator = tqdm(train_dataloader, desc="Iteration")
            for step, batch in enumerate(epoch_iterator):
                model.train()
                batch = tuple(t.cuda() for t in batch)
                input_ids, token_type_ids, attention_mask, labels, ids = batch
                outputs = model(input_ids,
                                attention_mask=attention_mask,
                                token_type_ids=token_type_ids,
                                labels=labels)
                loss = outputs[0]

                if gradient_accumulation_steps > 1:
                    loss /= gradient_accumulation_steps
                loss.backward()
                if (step + 1) % gradient_accumulation_steps == 0:
                    optimizer.step()
                    scheduler.step()
                    model.zero_grad()
            os.mkdir(f"train/{model_dir}")
            model.save_pretrained(f"train/{model_dir}")

            # evaluation
            eval_dataset = torch.load(f"data/{data_set}_dev.pt")["dataset"]
            eval_sampler = SequentialSampler(eval_dataset)
            eval_dataloader = DataLoader(eval_dataset, sampler=eval_sampler, batch_size=eval_batch_size)
            gt_dict, pred_dict = {}, {}
            for batch in tqdm(eval_dataloader, desc="Evaluating"):
                model.eval()
                with torch.no_grad():
                    batch = tuple(t.cuda() for t in batch)
                    input_ids, token_type_ids, attention_mask, labels, ids = batch
                    outputs = model(input_ids,
                                    attention_mask=attention_mask,
                                    token_type_ids=token_type_ids,
                                    labels=None)
                    pred_labels = torch.argmax(outputs[0], dim=1).reshape(-1)
                    for label, pred_label, key in zip(list(labels.detach().cpu().numpy()),
                                                      list(pred_labels.detach().cpu().numpy()),
                                                      list(ids.detach().cpu().numpy())):
                        gt_dict[key] = label
                        pred_dict[key] = pred_label
            res = metrics(gt_dict, pred_dict)
            with open(f"train/{model_dir}/res_dev.json", 'w') as f:
                json.dump(res, f)
            if res["micro_f1"] > best_micro_f1:
                best_micro_f1 = res["micro_f1"]
                best_model = model_dir

        with open(f"train/{data_set}_best.txt", 'w') as f:
            f.write(f"{best_micro_f1}, {best_model}")


def sentiment_analysis_data_test():
    from torch.utils.data import TensorDataset
    os.environ['TRANSFORMERS_CACHE'] = 'train/cache'
    from transformers import AutoTokenizer
    tokenizer = AutoTokenizer.from_pretrained("roberta-large")
    max_length = 400

    for data_set in ["course", "instructor"]:
        with open(f"data/{data_set}_test.txt", 'r') as f:
            test = f.readlines()
        print(len(test))

        for data_set_split, lines in [("test", test)]:
            input_ids, token_type_ids, attention_mask, label, id, sys = [], [], [], [], [], []
            index = 0
            for line in tqdm(lines):
                text, star = line.strip().split('\t')
                tokenized_input_seq_pair = tokenizer.encode_plus(text,
                                                                 max_length=max_length,
                                                                 return_token_type_ids=True, truncation=True)
                pad_length = max_length - len(tokenized_input_seq_pair['input_ids'])
                input_ids.append(tokenized_input_seq_pair['input_ids'] + [tokenizer.pad_token_id] * pad_length)
                token_type_ids.append(tokenized_input_seq_pair['token_type_ids'] + [0] * pad_length)
                attention_mask.append(tokenized_input_seq_pair['attention_mask'] + [0] * pad_length)
                label.append(int(star))  # positive=1, negative=0
                id.append(index)
                index += 1
            input_ids = torch.Tensor(input_ids).long()
            token_type_ids = torch.Tensor(token_type_ids).long()
            attention_mask = torch.Tensor(attention_mask).long()
            labels = torch.Tensor(label).long()
            ids = torch.Tensor(id).long()
            print(input_ids.size())
            dataset = TensorDataset(input_ids, token_type_ids, attention_mask, labels, ids)
            torch.save({"dataset": dataset}, f"data/{data_set}_{data_set_split}.pt")


def sentiment_analysis_test():
    from torch.utils.data import DataLoader, SequentialSampler
    os.environ['TRANSFORMERS_CACHE'] = 'train/cache'
    from transformers import AutoModelForSequenceClassification
    eval_batch_size = 8

    for data_set in ["course", "instructor"]:
        with open(f"train/{data_set}_best.txt", 'r') as f:
            best_model = f.readline().strip().split(' ')[1]

        # testing
        model = AutoModelForSequenceClassification.from_pretrained(f"train/{best_model}",
                                                                   cache_dir="train/cache").cuda()
        eval_dataset = torch.load(f"data/{data_set}_test.pt")["dataset"]
        eval_sampler = SequentialSampler(eval_dataset)
        eval_dataloader = DataLoader(eval_dataset, sampler=eval_sampler, batch_size=eval_batch_size)
        gt_dict, pred_dict = {}, {}
        for batch in tqdm(eval_dataloader, desc="Evaluating"):
            model.eval()
            with torch.no_grad():
                batch = tuple(t.cuda() for t in batch)
                input_ids, token_type_ids, attention_mask, labels, ids = batch
                outputs = model(input_ids,
                                attention_mask=attention_mask,
                                token_type_ids=token_type_ids,
                                labels=None)
                pred_labels = torch.argmax(outputs[0], dim=1).reshape(-1)
                for label, pred_label, key in zip(list(labels.detach().cpu().numpy()),
                                                  list(pred_labels.detach().cpu().numpy()),
                                                  list(ids.detach().cpu().numpy())):
                    gt_dict[int(key)] = int(label)
                    pred_dict[int(key)] = int(pred_label)
            # course_res[course] = pred_dict
        res = metrics(gt_dict, pred_dict)
        print(res)
        with open(f"train/{best_model}/res_test.json", 'w') as f:
            json.dump(res, f)
        # with open(f"train/{best_model}/pred_test.json", 'w') as f:
        #     json.dump(pred_dict, f)
        # with open(f"train/{best_model}/pred_course.json", 'w') as f:
        #     json.dump(course_res, f)


if __name__ == '__main__':
    # prepare train and dev data
    sentiment_analysis_data()
    # training
    sentiment_analysis()
    # prepare testing data
    sentiment_analysis_data_test()
    # testing
    sentiment_analysis_test()

