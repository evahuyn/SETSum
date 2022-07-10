import numpy as np
from LexRank import degree_centrality_scores
from sentence_transformers import SentenceTransformer, util
model = SentenceTransformer('paraphrase-mpnet-base-v2')


def old_summarizer(sents, sentiments, topk=5):
    sentence_embeddings = model.encode(sents)
    cos_scores = util.cos_sim(sentence_embeddings, sentence_embeddings).numpy()
    centrality_scores = degree_centrality_scores(cos_scores, threshold=None)
    most_central_sentence_indices = np.argsort(-centrality_scores)
    summary_sentiments = []
    for idx in most_central_sentence_indices[:topk]:
        summary_sentiments.append(sentiments[idx])
    print("document sentiment:", np.mean(sentiments), "summary_sentiment:", np.mean(summary_sentiments))


# balanced summarization
def new_summarizer(sents, sentiments, topk=5):
    # following the idea from https://arxiv.org/pdf/2109.06896.pdf
    sentence_embeddings = model.encode(sents)
    cos_scores = util.cos_sim(sentence_embeddings, sentence_embeddings).numpy()
    centrality_scores = degree_centrality_scores(cos_scores, threshold=None)
    doc_sentiment = np.mean(sentiments)

    def _compute_redundancy(idx, summary_idxes):
        if not summary_idxes: return 0
        return max([cos_scores[idx][senti] for senti in summary_idxes])

    def _sentiment_difference(idx, summary_idxes):
        return abs(doc_sentiment - np.mean([sentiments[idx]] + [sentiments[senti] for senti in summary_idxes]))

    summary_idxes = []
    best_idx = None
    while len(summary_idxes) < topk and best_idx != -1:
        best_idx, best_objective = -1, -1000
        for idx in range(len(sents)):
            if idx not in summary_idxes:
                redundancy = _compute_redundancy(idx, summary_idxes)
                sentiment_difference = _sentiment_difference(idx, summary_idxes)
                #  extraction objective: maximize centrality while minimizing redundancy and sentiment difference
                objective = centrality_scores[idx] - redundancy - sentiment_difference
                if objective > best_objective:
                    best_idx = idx
                    best_objective = objective
        if best_idx != -1:
            summary_idxes.append(best_idx)

    summary_sentiments = []
    for idx in summary_idxes:
        summary_sentiments.append(sentiments[idx])
    print("document sentiment:", doc_sentiment, "summary_sentiment:", np.mean(summary_sentiments))


if __name__ == '__main__':
    with open(f"example.txt", 'r') as f:
        lines = f.readlines()
    sents = [line.split('\t')[0] for line in lines]
    sentiments = [float(line.split('\t')[1]) for line in lines]
    print("====Baseline Extractive Summarization without Sentiment Balance and Redundancy Minimization====")
    old_summarizer(sents, sentiments)
    print("====Extractive Summarization with Sentiment Balance and Redundancy Minimization====")
    new_summarizer(sents, sentiments)