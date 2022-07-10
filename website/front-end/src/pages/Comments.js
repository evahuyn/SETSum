import React from "react";
import Topbar from "./Topbar"
import Courseinfos from "./Components/Courseinfos";
import {Runtime, Inspector} from "@observablehq/runtime";
import stats from "../Icons/statistics.png";
import comments from "../Icons/comment_blue.png";
import rawdata from "../Icons/data-storage.png";
import user from "../Icons/user.png";
import CourseBubble from "./Components/CourseBubble"
import InstructorBubble from "./Components/InstructorBubble";
import circleLegend1 from "./@d3/CircleLegendCourseComments";
import pieChart1 from "./@d3/PieChartCourseComments";
import circleLegend2 from "./@d3/CircleLegendInstructorComments";
import pieChart2 from "./@d3/PieChartInstructorComments";
import {Button} from "react-bootstrap";
import axios from "axios";
import {API} from "../service/api";
import {commentsRate} from "./Components/DataHelperFn";
import Sidebox from "./Components/Sidebox";
import QueryTable from "./Components/QueryTable";

const Comments = () =>{

    const cid = sessionStorage.getItem("cid")

    // get course info
    let courseInfo = JSON.parse(sessionStorage.getItem("Infos"))

    // circle legend for course
    const circleRef1 = React.useRef();
    const [loadCircleCC, setLoadCircleCC] = React.useState(true);

    React.useEffect(()=>{
        if(sessionStorage.getItem("CircleCC")!=null){
            setLoadCircleCC(false)
        }else{
              axios.get(`${API}/CourseStats/${cid}`).then((response)=>{
              let stats = response.data.data
                const circleLegendComments = {
                  tickValues:[100, parseInt(stats[2]/stats[0]*100)],
                  data: [stats[0], stats[2]]
                }
                sessionStorage.setItem("CircleCC", JSON.stringify(circleLegendComments));
              }).catch((error)=>{
                  console.log(error)
              }).finally(()=>{
                  setLoadCircleCC(false)
              })
        }
    }, [])
    React.useEffect(()=>{
        if(!loadCircleCC){
            const runtime = new Runtime();
            runtime.module(circleLegend1, Inspector.into(circleRef1.current));
            return () => runtime.dispose();
        }
    }, [loadCircleCC])

    // pie chart for course
    const pieRef1 = React.useRef();
    const [loadPieCC, setLoadPieCC] = React.useState(true);

    React.useEffect(()=>{
        if(sessionStorage.getItem("PieCC") != null){
            setLoadPieCC(false)
        }else{
            axios({
                method: 'get',
                url: `${API}/Tables/course-${cid}`,
                headers: {
                  'Access-Control-Allow-Origin': '*',
                    withCredentials: true
                },
            }).then((response)=>{
                console.log(commentsRate((response.data.data)))
                sessionStorage.setItem("PieCC", JSON.stringify(commentsRate(response.data.data)));
              }).catch((error) =>{
                console.log(error)
              }).finally(()=>{
                  setLoadPieCC(false);
            })
        }
    },[])
    React.useEffect(()=>{
        if(!loadPieCC){
            const runtime = new Runtime();
            runtime.module(pieChart1, Inspector.into(pieRef1.current));
            return () => runtime.dispose();
        }
    }, [loadPieCC])

    // circle legend for instructor
    const circleRef2 = React.useRef();
    const [loadCircleIC, setLoadCircleIC] = React.useState(true);

    React.useEffect(()=>{
        // CircleLegendCourseRate data
        if (sessionStorage.getItem("CircleIC")!=null){
            setLoadCircleIC(false)
        }else {
              axios.get(`${API}/InstructorStats/${cid}`).then((response)=> {
                  let stats = response.data.data
                  const circleLegendRate = {
                      tickValues: [100, parseInt(stats[2] / stats[0] * 100)],
                      data:[stats[0], stats[2]]
                  }
                  sessionStorage.setItem("CircleIC", JSON.stringify(circleLegendRate));
              }).catch((error)=>{
                  console.log(error)
              }).finally(()=>{
                  setLoadCircleIC(false)
              })
        }
    }, [])
    React.useEffect(()=>{
        if(!loadCircleIC){
            const runtime = new Runtime();
            runtime.module(circleLegend2, Inspector.into(circleRef2.current));
            return () => runtime.dispose();
        }
    }, [loadCircleIC])

    // pie chart for instructor
    const pieRef2 = React.useRef();
    const [loadPieIC, setLoadPieIC] = React.useState(true);

    React.useEffect(()=>{
        if(sessionStorage.getItem("PieIC") != null){
            setLoadPieIC(false)
        }else{
            axios({
                method: 'get',
                url: `${API}/Tables/instructor-${cid}`,
                headers: {
                  'Access-Control-Allow-Origin': '*',
                    withCredentials: true
                },
            }).then((response)=>{
                sessionStorage.setItem("PieIC", JSON.stringify(commentsRate(response.data.data)));
              }).catch((error) =>{
                console.log(error)
              }).finally(()=>{
                  setLoadPieIC(false);
            })
        }
    },[])

    React.useEffect(()=>{
        if(!loadPieIC){
            const runtime = new Runtime();
            runtime.module(pieChart2, Inspector.into(pieRef2.current));
            return () => runtime.dispose();
        }
    }, [loadPieIC])


    const sidebarColor = ["#000", "#57bbeb", "#000", "#000"]
    const sidebarPic = [stats, comments, rawdata, user]

    return(
        <>
            <Topbar sidebarColor={sidebarColor} sidebarPic={sidebarPic} />
            <div className={"background-block"} style={{minHeight: window.innerHeight*2}}>
                <Sidebox sidebarPic={sidebarPic}/>
                <Courseinfos course={courseInfo}/>

                <h2>Student Evaluations of Teaching: Open-ended Comments</h2>
                <div className={"divide-bar"}></div>

                {/*course comments*/}
                <div className={"row-title"} >
                    <h4 style={{marginBottom: "0"}}>Q1: Comments on overall assessment of this course.</h4>
                    <Button variant="secondary" href={"/course-rawdata"}>View Raw Comments</Button>
                </div>

                <div className={"row-block"}>
                    <div className={"sub-block"} style={{width: "45vw", height: "40vh"}}>
                        <h5>Response Rate</h5>
                        <div style={{display: "flex", textAlign: "left", width: "30vw"}}>
                            {loadCircleCC?<div>loading...</div>:<div ref={circleRef1}></div>}
                        </div>
                        {/*<ul style={{paddingTop: "1em"}}>*/}
                        {/*    <li>Out of 283 total reviews, 48 of the reviews have non-empty written comments</li>*/}
                        {/*</ul>*/}
                    </div>
                    <div className={"sub-block"} style={{width: "30vw", height: "40vh"}}>
                        <h5>Sentiment</h5>
                        {loadPieCC?<div>loading...</div>:<div ref={pieRef1}></div>}
                    </div>
                </div>

                <h4 style={{marginTop: "2em"}}>Distribution of Comments Across Prevalent Topics</h4>
                <div>Hover over bubbles to see top related sentences
                    <br />Click bubbles to view details</div>
                <div className={"row-block"} style={{paddingTop: "0.5em"}}>*Size of bubble: Prevalence of the topic among the comments</div>
                <div className={"row-block"} style={{paddingTop: 0, justifyContent:"flex-start", alignItems: "center"}}>
                    <div style={{minWidth: "1em", minHeight:"1em", backgroundColor:"#83ce5c", padding: "0.5em", marginRight: "1em"}}>Positive Sentiment</div>
                    <div style={{minWidth: "1em", minHeight:"1em", backgroundColor:"#F16529", padding: "0.5em"}}>Negative Sentiment</div>
                </div>

                <div className={"row-block"} style={{paddingTop: 0}}>
                    <CourseBubble />
                </div>

                {/*<QueryTable />*/}

                <div style={{marginTop: "3em"}} className={"divide-bar"}></div>

                {/*instructor comments*/}
                <div className={"row-title"} >
                    <h4 style={{marginBottom: "0"}}>Q2: Comments on overall assessment of this instructor.</h4>
                    <Button variant="secondary" href={"/instructor-rawdata"}>View Raw Comments</Button>
                </div>

                <div className={"row-block"}>
                    <div className={"sub-block"} style={{width: "45vw", height: "40vh"}}>
                        <h5>Response Rate</h5>
                        <div style={{display: "flex", textAlign: "left", width: "30vw"}}>
                            {loadCircleIC?<div>loading...</div>:<div ref={circleRef2}></div>}
                        </div>
                        {/*<ul style={{paddingTop: "1em"}}>*/}
                        {/*    <li>Out of 283 total reviews, 48 of the reviews have non-empty written comments</li>*/}
                        {/*</ul>*/}
                    </div>
                    <div className={"sub-block"} style={{width: "30vw", height: "40vh"}}>
                        <h5>Sentiment</h5>
                        {loadPieIC?<div>loading...</div>:<div ref={pieRef2}></div>}
                    </div>
                </div>

                <h4 style={{marginTop: "2em"}}>Distribution of Comments Across Prevalent Topics</h4>
                <div>Hover over bubbles to see top related sentences
                    <br />Click bubbles to view details</div>

                {/*note on bubble*/}
                <div className={"row-block"} style={{paddingTop: "0.5em"}}>*Size of bubble: Prevalence of the topic among the comments</div>
                <div className={"row-block"} style={{paddingTop: 0, justifyContent:"flex-start", alignItems: "center"}}>
                    <div style={{minWidth: "1em", minHeight:"1em", backgroundColor:"#83ce5c", padding: "0.5em", marginRight: "1em"}}>Positive Sentiment</div>
                    <div style={{minWidth: "1em", minHeight:"1em", backgroundColor:"#F16529", padding: "0.5em"}}>Negative Sentiment</div>
                </div>
                <div className={"row-block"} style={{paddingTop: 0}}>
                    <InstructorBubble />
                </div>

            </div>
        </>
    )
}

export default Comments;