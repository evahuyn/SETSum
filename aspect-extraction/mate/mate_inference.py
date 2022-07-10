#!/usr/bin/env python
import h5py
import argparse
from mate import AspectAutoencoder
import torch
from torch.autograd import Variable
import numpy as np
from numpy.random import permutation, seed
from scipy.cluster.vq import kmeans

def model_inference():
    parser = argparse.ArgumentParser(
      description =__doc__,
      formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--model', help='path to the model', type=str, default='')
    parser.add_argument('--data', help="Dataset name (without extension)", type=str)
    parser.add_argument('--inference_data', help="hdf5 file of test segments", type=str, default='')
    parser.add_argument('--min_len', help="Minimum number of non-stop-words in segment (default: 2)", type=int, default=2)
    parser.add_argument('--aspects', help="Number of aspects (default: 10)", type=int, default=10)
    parser.add_argument('--aspect_seeds', help='file that contains aspect seed words (overrides number of aspects)',
            type=str, default='')
    parser.add_argument('--recon_method', help="Method of reconstruction (centr/init/fix/cos)",
            type=str, default='fix')
    parser.add_argument('--kmeans', help="Aspect embedding initialization with kmeans", action='store_true')
    parser.add_argument('--kmeans_iter', help="Number of times to re-run kmeans (default: 20)", type=int, default=20)
    parser.add_argument('--attention', help="Use word attention", action='store_true')
    parser.add_argument('--negative', help="Number of negative samples (default: 20)", type=int, default=20)
    parser.add_argument('--fix_w_emb', help="Fix word embeddings", action='store_true')
    parser.add_argument('--fix_a_emb', help="Fix aspect embeddings", action='store_true')
    parser.add_argument('--epochs', help="Number of epochs (default: 10)", type=int, default=15)
    parser.add_argument('--lr', help="Learning rate (default: 0.001)", type=float, default=0.001)
    parser.add_argument('--l', help="Orthogonality loss coefficient (default: 1)", type=float, default=1)
    parser.add_argument('--savemodel', help="File to save model in (default: don't)", type=str, default='')
    parser.add_argument('--semeval', help="Output file for evaluation (default: don't)", type=str, default='')
    parser.add_argument('--out', help="Output file for summary generation (default: output.txt)",
            type=str, default='output.txt')
    parser.add_argument('-q', '--quiet', help="No information to stdout", action='store_true')
    parser.add_argument('--seed', help="Random seed (default: system seed, -1)", type=int, default=-1)
    args = parser.parse_args()

    if args.seed != -1:
        torch.manual_seed(args.seed)
        seed(args.seed)

    id2word = {}
    word2id = {}
    fvoc = open(args.data + '_word_mapping.txt', 'r')
    for line in fvoc:
        word, id = line.split()
        id2word[int(id)] = word
        word2id[word] = int(id)
    fvoc.close()

    f = h5py.File(args.data + '.hdf5', 'r')
    batches = []
    original = []
    scodes = []
    for b in f['data']:
        batches.append(Variable(torch.from_numpy(f['data/' +  b][()]).long()))
        original.append(list(f['original/' + b][()]))
        scodes.append(list(f['scodes/' + b][()]))

    w_emb_array = f['w2v'][()]
    w_emb = torch.from_numpy(w_emb_array)
    vocab_size, emb_size = w_emb.size()
    f.close()

    if args.kmeans:
        # kmeans initialization (ABAE)
        if not args.quiet:
            print('Running k-means...')
        a_emb, _ = kmeans(w_emb_array, args.aspects, iter=args.kmeans_iter)
        a_emb = torch.from_numpy(a_emb)
        seed_w = None
        args.num_seeds = None
    elif args.aspect_seeds != '':
        # seed initialization (MATE)
        fseed = open(args.aspect_seeds, 'r')
        aspects_ids = []
        if args.recon_method == 'fix' \
                or args.recon_method == 'init':
            seed_weights = []
        else:
            seed_weights = None

        for line in fseed:
            if args.recon_method == 'fix' \
                    or args.recon_method == 'init':
                seeds = []
                weights = []
                for tok in line.split():
                    word, weight = tok.split(':')
                    if word in word2id:
                        seeds.append(word2id[word])
                        weights.append(float(weight))
                    else:
                        seeds.append(0)
                        weights.append(0.0)
                aspects_ids.append(seeds)
                seed_weights.append(weights)
            else:
                seeds = [word2id[word] if word in word2id else 0 for word in line.split()]
                aspects_ids.append(seeds)
        fseed.close()

        if seed_weights is not None:
            seed_w = torch.Tensor(seed_weights)
            seed_w /= seed_w.norm(p=1, dim=1, keepdim=True)
        else:
            seed_w = None

        if args.recon_method == 'centr':
            centroids = []
            for seeds in aspects_ids:
                centroids.append(w_emb_array[seeds].mean(0))
            a_emb = torch.from_numpy(np.array(centroids))
            args.aspects = len(centroids)
            args.num_seeds = len(aspects_ids[0])
        else:
            clouds = []
            for seeds in aspects_ids:
                clouds.append(w_emb_array[seeds])
            a_emb = torch.from_numpy(np.array(clouds))
            args.aspects = len(clouds)
            args.num_seeds = a_emb.size()[1]
    else:
        a_emb = None
        seed_w = None
        args.num_seeds = None

    model = AspectAutoencoder(vocab_size, emb_size,
            num_aspects=args.aspects, neg_samples=args.negative,
            w_emb=w_emb, a_emb=a_emb, recon_method=args.recon_method, seed_w=seed_w,
            num_seeds=args.num_seeds, attention=args.attention, fix_w_emb=args.fix_w_emb,
            fix_a_emb=args.fix_a_emb)

    if torch.cuda.is_available():
        model = model.cuda()

    checkpoint = torch.load(args.model)
    model.load_state_dict(checkpoint['model_state_dict'])
    epoch = checkpoint['epoch']
    print("Successfully loaded model {0}".format(args.model))

    # read data to inference
    test_batches = []
    test_original = []
    test_scodes = []
    if args.inference_data != '':
        f = h5py.File(args.inference_data, 'r')
        for b in f['data']:
            test_batches.append(Variable(torch.from_numpy(f['data/' +  b][()]).long()))
            test_original.append(list(f['original/' + b][()]))
            test_scodes.append(list(f['scodes/' + b][()]))
            # print("test_scodes: {0}".format(test_scodes))
    f.close()

    if args.out != '':
        out = ''

    model.eval()

    for i in range(len(test_batches)):
        inputs = test_batches[i]
        orig = test_original[i]
        sc = test_scodes[i]
        if torch.cuda.is_available():
            inputs = inputs.cuda()

        _, a_probs = model(inputs, i)

        for j in range(a_probs.size()[0]):
            if args.out != '':
                out += sc[j].decode("utf-8")
                for a in range(a_probs.size()[1]):
                    out += '\t{0:.6f}'.format(a_probs.data[j][a])
                out += '\t' + orig[j].decode("utf-8") + '\n'

    if args.out != '':
        fsum = open('{0}'.format(args.out), 'w')
        fsum.write(out)
        print("Write inference output to {0}".format(args.out))
        fsum.close()


if __name__ == '__main__':
    model_inference()