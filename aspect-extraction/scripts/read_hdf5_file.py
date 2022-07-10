import h5py
import argparse
from torch.autograd import Variable
import torch

def read_hdf5():

    parser = argparse.ArgumentParser(
      description =__doc__,
      formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--file', help='file to process', type=str, default='')
    args = parser.parse_args()

    with h5py.File(args.file, "r") as f:
        # List all groups
        print("Keys: %s" % f.keys())
        for key in list(f.keys()):
            # print each one
            data = list(f[key+"/1"])
            print("Current Key is : %s" % key)
            print(data)
        # print(f["labels"]["0"])

def save_hdf5_test_labels():

    parser = argparse.ArgumentParser(
      description =__doc__,
      formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--file', help='file to process', type=str, default='')
    parser.add_argument('--out', help='path to save output file', type=str, default='')
    args = parser.parse_args()

    test_batches = []
    test_labels = []
    test_original = []
    test_scodes = []
    if args.file != '':
        f = h5py.File(args.file, 'r')
        for b in f['data']:
            test_batches.append(Variable(torch.from_numpy(f['data/' + b][()]).long()))
            test_labels.append(Variable(torch.from_numpy(f['labels/' + b][()]).long()))
            test_original.append(list(f['original/' + b][()]))
            test_scodes.append(list(f['scodes/' + b][()]))
    f.close()

    labels_list = []
    sumout = ''
    for i in range(len(test_batches)):
        labels = test_labels[i]
        orig = test_original[i]
        sc = test_scodes[i]
        for j in range(labels.size()[0]):
            sumout += sc[j].decode("utf-8")
            for a in range(labels.size()[1]):
                sumout += '\t{0:.6f}'.format(labels.data[j][a])
            sumout += '\t' + orig[j].decode("utf-8") + '\n'

    fsum = open('./data/gtlabels/{0}.txt'.format(args.out), 'w')
    fsum.write(sumout)
    fsum.close()

if __name__ == '__main__':
    # read_hdf5()
    save_hdf5_test_labels()
