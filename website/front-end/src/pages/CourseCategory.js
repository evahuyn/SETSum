import React from "react";
import Topbar from "./Topbar"
import Courseinfos from "./Components/Courseinfos";
import stats from "../Icons/statistics.png";
import comments from "../Icons/comment_blue.png";
import rawdata from "../Icons/data-storage.png";
import user from "../Icons/user.png";
import HoverScatter from "./@d3/CourseHoverScatter";
import {Inspector, Runtime} from "@observablehq/runtime";
import {Button, Dropdown, DropdownButton} from "react-bootstrap";
import {numComments} from "./Components/DataHelperFn";
import RawTable from "./Components/RawTable";
import Footnote from "./Components/Footnote";

const CourseCategory = () =>{
    // get course info
    let courseInfo = JSON.parse(sessionStorage.getItem("Infos"))

    const sidebarColor = ["#000", "#57bbeb", "#000", "#000" ]
    const sidebarPic = [stats, comments, rawdata, user]

    const scatterRef = React.useRef();

      React.useEffect(() => {
        const runtime = new Runtime();
        runtime.module(HoverScatter, Inspector.into(scatterRef.current));
        return () => runtime.dispose();
      }, []);

      const aspect = sessionStorage.getItem("category")
    const aspectCap = aspect.split(" ").map((word) => {
    return word[0].toUpperCase() + word.substring(1);
}).join(" ")
      const summary = sessionStorage.getItem("summary").split("[SEP] ")
      summary.pop()
      const allComments = JSON.parse(sessionStorage.getItem("courseScatter"))
    // get full comments corresponding to summary
    let commentList = []
    summary.forEach(sent =>{
        let sid = Array.from(allComments).filter(item => item.comments === sent)[0].id
        let cid = sid.split("|")[1].split("-")[0]
        let currentCom = Array.from(allComments).filter(item => item.id.split("|")[1].split("-")[0] == cid)
        currentCom = currentCom.sort((a, b) => a.id.split("|")[1].split("-")[1] - b.id.split("|")[1].split("-")[1])
        currentCom = currentCom.map(item => item.comments).join(" ")
        let comObjct = {
            "sid": sid,
            "summary": sent,
            "comments": currentCom
        }
        commentList.push(comObjct)
            // .map(item => item.comments).join(" ")
        // commentList.push(currentCom)
    })
    console.log(commentList)


    // comments table
    const dropdownOptions = ["Default", "From Positive to Negative", "From Negative to Positive"];
    const [select, setSelect] = React.useState(0);

    const handleSelect = (e) =>{
        setSelect(e);
    }

    let tableData = JSON.parse(sessionStorage.getItem("courseScatter")).filter(item => item.category==aspect)
    let numSentence = tableData.length
    let numCom = numComments(tableData)


    Array.from(tableData).map((item) => {
            if (item.sentiment == "positive"){
              item.color="green"
            }else {
              item.color="red"
            }
          })

        if(select==1){
            tableData.sort((a, b) =>b.sentimentScore - a.sentimentScore)
        }else if(select==2){
            tableData.sort((a, b) =>a.sentimentScore - b.sentimentScore)
        }else{
            tableData.sort((a, b) => a.id.split("|")[1].split("-")[0] - b.id.split("|")[1].split("-")[0])
        }

    return(
        <>
            <Topbar sidebarColor={sidebarColor} sidebarPic={sidebarPic} />
            <div className={"background-block"}>
                <Courseinfos course={courseInfo}/>
                <div style={{textAlign: "left", paddingLeft: "10%", paddingTop: "1em"}}>
                    <h5>Top Sentences Related to "{aspectCap}": </h5>
                    <div style={{backgroundColor: "#edffe787", paddingRight: "1em", paddingLeft: "1em", marginBottom: "0.5em", width: "fit-content"}}>Click the dropdown to view sentence in the context of original comment</div>
                    <div className={"row-block"} style={{paddingLeft: 0,
                    paddingTop: 0}}>
                        <Footnote data={commentList} />
                    </div>
                    {/*<ul>*/}
                    {/*    {summary.map((item) =>(*/}
                    {/*        <li>{item}</li>*/}
                    {/*    ))}*/}
                    {/*</ul>*/}

                </div>
                <div className={"row-block"} style={{paddingTop: "3vh"}}>
                    <div className={"sub-block"} style={{width: "-webkit-fill-available"}}>
                        <h4>Scatterplot of All Sentences Related to "{aspectCap}"</h4>
                        <div ref={scatterRef}></div>
                    </div>
                </div>

                {/*comments table*/}
                <div className={"row-block"}>
                    <div style={{backgroundColor: "white", width: "100%", padding: "2em"}}>
                        <h4>All Sentences Related to "{aspectCap}"</h4>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1em"}}>
                                        <div style={{textAlign: "left"}}>Number of Sentences: {numSentence}</div>
                                          <DropdownButton
                                          title="Sort"
                                          id="dropdown-menu-align-right"
                                          onSelect={handleSelect}
                                            >
                                              {Array.from(dropdownOptions).map((item, i) => (
                                                  <Dropdown.Item key={item} eventKey={i}>{item}</Dropdown.Item>
                                              ))}
                                          </DropdownButton>
                                    </div>
                        <RawTable data={tableData} />
                    </div>
                </div>

                <Button href={"/comments"} style={{marginTop: "3vh"}}>Back to Main</Button>
            </div>
        </>
    )
}

export default CourseCategory;