import pandas as pd
import argparse
import numpy as np

def f1_score():
    parser = argparse.ArgumentParser(
      description =__doc__,
      formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--gt_data', help='path to the ground truth labels', type=str, default='')
    parser.add_argument('--predict_data', help="path to the predicted data", type=str)
    parser.add_argument('--threshold', help="set threshold for prediction", default="0.15")
    args = parser.parse_args()

    gt_labels = {}
    with open(args.gt_data, "r") as f:
        gt_data = f.readlines()
        for line in gt_data:
            temp_list = line.split("\t")
            id = temp_list[0]
            temp_list.pop()
            temp_list.pop(0)
            temp_list = np.array([float(e) for e in temp_list])
            gt_labels[id] = np.array(temp_list)

    predict_labels = {}
    with open(args.predict_data, "r") as f:
        gt_data = f.readlines()
        for line in gt_data:
            temp_list = line.split("\t")
            id = temp_list[0]
            temp_list.pop()
            temp_list.pop(0)
            temp_list = np.array([float(e) for e in temp_list])
            # set threshold
            temp_list[temp_list > float(args.threshold)] = 1
            temp_list[temp_list < float(args.threshold)] = 0
            predict_labels[id] = temp_list

    # precision = TP/(TP + FP)
    # recall = TP/(TP + FN)
    # F1 = 2*precision*recall/(precision+recall)
    # accuracy = (TP + TN) / total
    total = 0
    TP = 0
    TN = 0
    FP = 0
    FN = 0
    for id in gt_labels.keys():
        gt_tmp = gt_labels[id]
        predict_tmp = predict_labels[id]
        # print("Ground_truth_label: {0}".format(gt_tmp))
        # print("Predicted_label: {0}".format(predict_tmp))
        for i in range(len(gt_tmp)):
            if (gt_tmp[i] == predict_tmp[i]) & (gt_tmp[i] == 1):
                TP += 1
            elif (gt_tmp[i] == predict_tmp[i]) & (gt_tmp[i] == 0):
                TN += 1
            elif (gt_tmp[i] != predict_tmp[i]) & (predict_tmp[i] == 1):
                FP += 1
            elif (gt_tmp[i] != predict_tmp[i]) & (predict_tmp[i] == 0):
                FN += 1
        total += len(gt_tmp)

    precision = TP/(TP + FP)
    recall = TP/(TP + FN)
    F1 = 2*precision*recall/(precision+recall)
    accuracy = (TP + TN) / total
    print("precision is {0}".format(precision))
    print("recall is {0}".format(recall))
    print("f1 score is {0}".format(F1))
    print("accuracy is {0}".format(accuracy))

if __name__ == '__main__':
    f1_score()