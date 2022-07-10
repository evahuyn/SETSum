export const numComments = (data) =>{

    let comments_id = []
    for (let i=0; i<data.length; i++){
        let comment_id = data[i]["id"].split("|")[1].split("-")[0]
        comments_id.push(comment_id)
    }
    comments_id = new Set(comments_id)

    return comments_id.size;
}

export const commentsRate = (data) =>{
    let ratio = [0, 0]
    for (let i=0; i<data.length; i++){
        let comment_id = data[i]["score"]
        if (parseFloat(comment_id) > 0.5){
            ratio[0] += 1
        }else if (parseFloat(comment_id) < 0.5){
            ratio[1] += 1
        }
    }
    return [{"name":"Negative","value":ratio[1]},{"name":"Positive","value":ratio[0]}];
}

