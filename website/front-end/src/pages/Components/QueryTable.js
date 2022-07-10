import axios from "axios";
import React from "react";

function QueryTable(){
    React.useEffect(() =>{
        let url = "https://setsum.cs.unc.edu/query_new"
        let myobj = {'course': 'Fall2018_COMP_110-002_INTRO_PROGRAMMING', 'query': "exam"}
        // axios({
        //     method: 'post',
        //     url: 'https://setsum.cs.unc.edu/query_new',
        //     headers: {
        //       AccessControlAllowOrigin: '*',
        //         withCredentials: true
        //     },
        //     data: myobj,
        //     auth: {username: 'setsum', password: 'setsum@unc09032021'}
        //
        // }).then((response) =>{
        //     console.log(response)
        // }).catch((error) =>{
        //     console.log(error)
        // })
        // axios.post('https://setsum.cs.unc.edu/query_new', myobj, {
        //     auth: {username: 'setsum', password: 'setsum@unc09032021'},
        //     headers: {
        //         AccessControlAllowOrigin: '*',
        //         withCredentials: true
        //     }
        // }).then((response) =>{
        //     console.log(response)
        // }).catch((error) =>{
        //     console.log(error)
        // })
        //
    axios({
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "post",
      url: url,
      auth: {
        username: 'setsum',
        password: 'setsum@unc09032021'
      },
      data: {
        myobj
      }
    });
    }, [])

    return(
        <div>
        </div>
    )
}

export default QueryTable;