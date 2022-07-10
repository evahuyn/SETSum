import React from "react";
import "../styles/Topbar.css"
import "../styles/Main.css"
import Topbar from "./Topbar"
import Courseinfos from "./Components/Courseinfos";
import {Inspector, Runtime} from "@observablehq/runtime";
import circleLegend1 from "./@d3/CircleLegendCourseRate"
import pieChart1 from "./@d3/PieChartCourseRate"
import circleLegend2 from "./@d3/CircleLegendInstructorRate"
import pieChart2 from "./@d3/PieChartInstructorRate"
import stats_blue from "../Icons/statistics_blue.png"
import user from "../Icons/user.png"
import comments from "../Icons/comment.png"
import rawdata from "../Icons/data-storage.png"
import axios from "axios";
import {API} from "../service/api";
import {useNavigate} from "react-router-dom";
import Sidebox from "./Components/Sidebox";

// this page displays the rating information
const Statistics = () =>{

    const cid = sessionStorage.getItem("cid")

    // get course info
    const [courseInfo, setCourseInfo] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() =>{
        // course info
        if(sessionStorage.getItem("Infos")!= null){
            console.log("Infos already stored")
            console.log(sessionStorage)
            setCourseInfo(JSON.parse(sessionStorage.getItem("Infos")))
            setLoading(false)
        }else{
            console.log("Store info for the first time")
            axios.get(`${API}/Infos/${cid}`)
                .then((response) => {
                setCourseInfo(response.data)
                sessionStorage.setItem("Infos", JSON.stringify(response.data))
            }).catch((error) =>{
                console.log(error)
            }).finally(()=>{
                setLoading(false)
            })
        }
    }, [])

    // circle legend course rates
    const circleRef1 = React.useRef();
    const [loadCircleCR, setLoadCircleCR] = React.useState(true);

    React.useEffect(()=>{
        // CircleLegendCourseRate data
        if (sessionStorage.getItem("CircleCR")!=null){
            setLoadCircleCR(false)
        }else {
              axios.get(`${API}/CourseStats/${cid}`).then((response)=> {
                  let courseStats = response.data.data
                  const circleLegendCourseRate = {
                      tickValues: [100, parseInt(courseStats[1] / courseStats[0] * 100)],
                      data: [courseStats[0], courseStats[1]]
                  }
                  sessionStorage.setItem("CircleCR", JSON.stringify(circleLegendCourseRate));
              }).catch((error)=>{
                  console.log(error)
              }).finally(()=>{
                  setLoadCircleCR(false)
              })
        }
    }, [])

    React.useEffect(() =>{
        if(!loadCircleCR){
            const runtime = new Runtime();
            runtime.module(circleLegend1, Inspector.into(circleRef1.current));
            return () => runtime.dispose();
        }
    }, [loadCircleCR])

    // pie chart course rates
    const pieRef1 = React.useRef();
    const [loadPieCR, setLoadPieCR] = React.useState(true);

    React.useEffect(()=>{
        if(sessionStorage.getItem("PieCR") != null){
            setLoadPieCR(false)
        }else{
            axios.get(`${API}/QuantRates/${cid}`).then((response)=>{
                let rates = response.data.crate
                let PieRate = [{"name":"Negative","value":rates[1]},{"name":"Positive","value":rates[0]}]
                sessionStorage.setItem("PieCR", JSON.stringify(PieRate));
              }).catch((error) =>{
                console.log(error)
              }).finally(()=>{
                  setLoadPieCR(false);
            })
        }
    },[])

    React.useEffect(()=>{
        if(!loadPieCR){
            const runtime = new Runtime();
            runtime.module(pieChart1, Inspector.into(pieRef1.current));
            return () => runtime.dispose();
        }
    }, [loadPieCR])

    // circle legend instructor rates
    const circleRef2 = React.useRef();
    const [loadCircleIR, setLoadCircleIR] = React.useState(true);

    React.useEffect(()=>{
        // CircleLegendCourseRate data
        if (sessionStorage.getItem("CircleIR")!=null){
            setLoadCircleIR(false)
        }else {
              axios.get(`${API}/InstructorStats/${cid}`).then((response)=> {
                  let stats = response.data.data
                  const circleLegendRate = {
                      tickValues: [100, parseInt(stats[1] / stats[0] * 100)],
                      data: [stats[0], stats[1]]
                  }
                  sessionStorage.setItem("CircleIR", JSON.stringify(circleLegendRate));
              }).catch((error)=>{
                  console.log(error)
              }).finally(()=>{
                  setLoadCircleIR(false)
              })
        }
    }, [])

    React.useEffect(()=>{
        if(!loadCircleIR){
            const runtime = new Runtime();
            runtime.module(circleLegend2, Inspector.into(circleRef2.current));
            return () => runtime.dispose();
        }
    }, [loadCircleIR])

    // pie chart instructor rates
    const pieRef2 = React.useRef();
    const [loadPieIR, setLoadPieIR] = React.useState(true);

    React.useEffect(()=>{
        if(sessionStorage.getItem("PieIR") != null){
            setLoadPieIR(false)
        }else{
            axios.get(`${API}/QuantRates/${cid}`).then((response)=>{
                let rates = response.data.irate
                let PieRate = [{"name":"Negative","value":rates[1]},{"name":"Positive","value":rates[0]}]
                sessionStorage.setItem("PieIR", JSON.stringify(PieRate));
              }).catch((error) =>{
                console.log(error)
              }).finally(()=>{
                  setLoadPieIR(false);
            })
        }
    },[])

    React.useEffect(()=>{
        if(!loadPieIR){
            const runtime = new Runtime();
            runtime.module(pieChart2, Inspector.into(pieRef2.current));
            return () => runtime.dispose();
        }
    }, [loadPieIR])

    const sidebarColor = ["#57bbeb","#000", "#000", "#000"]
    const sidebarPic = [stats_blue, comments, rawdata, user]

    return(
        <>
            <Topbar sidebarColor={sidebarColor} sidebarPic={sidebarPic}/>
            <div className={"background-block"}>
                <Sidebox sidebarPic={sidebarPic}/>
                {loading? <div>Loading Course Info...</div>:<Courseinfos course={courseInfo}/>}

                <h2>Student Evaluations of Teaching: Quantitative Ratings</h2>
                <p>*Note: we only included two quantitative rating questions as sample here, the full report will include more questions</p>
                <div className={"divide-bar"}></div>

                <h4 style={{marginBottom: "0"}}>Q1: Overall, this course was excellent (5-point scale). </h4>
                <div className={"row-block"}>
                    <div className={"sub-block"} style={{width: "45vw", height: "50vh"}}>
                        <h5>Response Rate</h5>
                        <div style={{height: "5vh"}}></div>
                        <div style={{display: "flex", textAlign: "left", width: "30vw"}}>
                            {loadCircleCR?<div>loading...</div>:<div ref={circleRef1}></div>}
                        </div>
                        {/*<ul style={{paddingTop: "1em"}}>*/}
                        {/*    <li>Out of 283 total reviews, 113 of the reviews had non-empty submissions</li>*/}
                        {/*</ul>*/}
                    </div>
                    <div className={"sub-block"} style={{width: "30vw", height: "50vh"}}>
                        <h5>Sentiment</h5>
                        <p style={{fontSize: "0.5em", textAlign: "left"}}>The rating is based on a <b>5-point Likert scale</b>:
                            <br />5 = Strongly Agree, 4 = Agree, 3 = Neither agree nor disagree, 2 = Disagree, 1 = Strongly Disagree;
                            <br /><b>Sentiment</b>: Positive: (5 and 4); Negative: (3, 2, and 1)</p>
                        {loadPieCR?<div>loading...</div>:<div ref={pieRef1}></div>}

                    </div>
                </div>
                <div style={{marginTop: "2em"}} className={"divide-bar"}></div>

                <h4 style={{marginBottom: "0"}}>Q2: Overall, this instructor was an effective teacher (5-point scale).</h4>
                <div className={"row-block"}>
                    <div className={"sub-block"} style={{width: "45vw", height: "50vh"}}>
                        <h5>Response Rate</h5>
                        <div style={{height: "5vh"}}></div>
                        <div style={{display: "flex", textAlign: "left", width: "30vw"}}>
                            {loadCircleIR?<div>loading...</div>:<div ref={circleRef2}></div>}
                        </div>
                        {/*<ul style={{paddingTop: "1em"}}>*/}
                        {/*    <li>Out of 283 total reviews, 113 of the reviews had non-empty submissions</li>*/}
                        {/*</ul>*/}
                    </div>
                    <div className={"sub-block"} style={{width: "30vw", height: "50vh"}}>
                        <h5>Sentiment</h5>
                        <p style={{fontSize: "0.5em", textAlign: "left"}}>The rating is based on a <b>5-point Likert scale</b>:
                            <br />5 = Strongly Agree, 4 = Agree, 3 = Neither agree nor disagree, 2 = Disagree, 1 = Strongly Disagree;
                            <br /><b>Sentiment</b>: Positive: (5 and 4); Negative: (3, 2, and 1)</p>
                        {loadPieIR?<div>loading...</div>:<div ref={pieRef2}></div>}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Statistics;