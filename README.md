# SETSUM (NAACL Demo 2022)

This repository contains the code for the following paper:

### SETSUM: Summarization and Visualization of Student Evaluations of Teaching

```
@inproceedings{hu-etal-2022-setsum,
    title = "SETSUM: Summarization and Visualization of Student Evaluations of Teaching",
    author = “Hu, Yinuo  and
      Zhang, Shiyue  and
      Sathy, Viji  and
      Panter, A. T.  and
      Bansal, Mohit”,
    booktitle = "Proceedings of the 2022 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies: Demonstrations",
    year = "2022”,
    publisher = "Association for Computational Linguistics",
}
```
![Alt Text](./SETSum%20-%20fps15.gif)

SETSum v1.1 (Please contact us for credentials): https://setwebsite.netlify.app/

YouTube: https://youtu.be/-Z2BBS7dvw0

SETSum is a web-based system which aims to summarize and visualize Student Evaluations of Teaching (SETs) data. 

## System Description
- SETSum allows instructors to view personalilzed SET analysis report. Here's a demo video to walk you through SETSum v1.1. Please contact the author to get access to the website. 

- SETSum include two parts: Quantitative Rating Analysis and Qualitative Comments Analysis
- Rating Analysis:

    - Provide visualized statistical summary of student ratings on courses and instructors.

- Comments Analysis:
    
    - Incorporate three Machine Learning based modules to analyze student comments on courses and instructors. 
    - **Sentiment Prediction**:
        - We train a sentiment prediction model to predict whether a comment sentence is positive or negative.
        - The sentiment prediction aims to provide instructors a general understanding of students' attitudes. We also allow instructors to rank their comments from positive to negative to avoid direct exposure to negative comments. 

    - **Aspect Extraction**
        - We extract prevalent topics from open-ended SETs responses.
        - The aspects should provide instructors with a general impressions of what topics students focus more on. 

    - **Extractive Summarization**
        - We aim to extract a summary with high centrality, low redundancy, and a balanced sentiment. Details of the algorithm can be found in our paper. 

## Intended Use

- The primary purpose of this system is to provide instructors with a more efficient and visualized approach to read main ideas from Student Evaluations of Teaching (SETs). 

- The target user of the system should be instructors who teach the courses and administration managers who have permissions on management of SETs. 

- The system itself will not make any judgements or evaluations on courses or instructors, and it should not be used as the only evidence to make decisions. 

## Implementation details

- Sentiment Analysis source code in [sentiment](https://github.com/evahuyn/SETSum/tree/main/sentiment)

- Aspect Extraction source code in [aspect-extraction](https://github.com/evahuyn/SETSum/tree/main/aspect-extraction)

- Extractive Summarization source code in [summarization](https://github.com/evahuyn/SETSum/tree/main/summarization)

- We used [React](https://reactjs.org/) framework for front-end development and [Firebase](https://firebase.google.com) for back-end development.

    - See source coded in [website](https://github.com/evahuyn/SETSum/tree/main/website) 