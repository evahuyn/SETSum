import React from "react";
import Topbar from "./Topbar"
import Courseinfos from "./Components/Courseinfos";
import stats from "../Icons/statistics.png";
import comments from "../Icons/comment.png";
import rawdata from "../Icons/data-storage_blue.png";
import user from "../Icons/user.png";
import RawTable from "./Components/RawTable_v2";
import {Button, Dropdown, DropdownButton} from "react-bootstrap";
import axios from "axios";
import {numComments} from "./Components/DataHelperFn";
import {API} from "../service/api";


const InstructorRawdata = () =>{

    const cid = sessionStorage.getItem("cid")

    // get course info
    let courseInfo = JSON.parse(sessionStorage.getItem("Infos"))

    const sidebarColor = ["#000", "#000", "#57bbeb", "#000"]
    const sidebarPic = [stats, comments, rawdata, user]

    const dropdownOptions = ["Default", "From Positive to Negative", "From Negative to Positive"];
    const [select, setSelect] = React.useState(0);

    const handleSelect = (e) =>{
        setSelect(e);
    }

    const [tableData, setTableData] = React.useState(null);
    const [numSentence, setNumSentence] = React.useState(0);
    const [numCom, setNumComments] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() =>{
        if(sessionStorage.getItem("instructorRawData")==null){
            axios({
              method: 'get',
              url: `${API}/Tables/instructor-${cid}`,
                headers: {
                  'Access-Control-Allow-Origin': '*',
                  withCredentials: true
                }
            }).then(function (response) {
                sessionStorage.setItem("instructorRawData", JSON.stringify(response.data.data))
                setTableData(response.data.data)
                  setNumSentence(response.data.data.length)
                  setNumComments(numComments(response.data.data))
            }).catch((error) =>{
                setError(error)
                console.log(error)
            }).finally(()=>{
                setLoading(false)
            })
        }else{
            let tableData = JSON.parse(sessionStorage.getItem("instructorRawData"))
            setTableData(tableData)
            setNumSentence(tableData.length)
            setNumComments(numComments(tableData))
            setLoading(false)
        }


    }, [])

    if (!loading){
            // raw table data
          Array.from(tableData).map((item) => {
            if (item.sentiment == "positive"){
              item.color="green"
            }else {
              item.color="red"
            }
          })

        if(select==1){
            tableData.sort((a, b) =>b.score - a.score)
        }else if(select==2){
            tableData.sort((a, b) =>a.score - b.score)
        }else{
            tableData.sort((a, b) => a.id.split("|")[1].split("-")[0] - b.id.split("|")[1].split("-")[0])
        }
    }

    // version 2
    const [reformatComments, setReformatComments] = React.useState([])
    React.useEffect(()=>{
        if(loading!=true){
            let idlist = Array.from(tableData).map((item)=>item.id.split("|")[1].split("-")[0])
            idlist = Array.from(new Set(idlist))
            let reformatComments = []
            idlist.forEach(id =>{
                let sublist = []
                let templist = Array.from(tableData).filter((item) => item.id.split("|")[1].split("-")[0]==id)
                let tempids = []
                templist.forEach(item =>{
                    if(!tempids.includes(item.id)){
                        tempids.push(item.id)
                        sublist.push(item)
                    }
                })
                sublist = sublist.sort((a, b) => a.id.split("|")[1].split("-")[1] - b.id.split("|")[1].split("-")[1])
                reformatComments.push(sublist)
            })
            setReformatComments(reformatComments)
        }
    }, [loading])

    return(
        <>
            <Topbar sidebarColor={sidebarColor} sidebarPic={sidebarPic} />
            <div className={"background-block"}>
                <Courseinfos course={courseInfo}/>

                <div className={"row-block"}>
                    <div className={"sub-block"} style={{width: "-webkit-fill-available"}}>
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                            <div style={{textAlign: "left", paddingBottom: "1em"}}>Number of Comments: {numCom} <br />
                            Number of Sentences: {numSentence}</div>
                           {/*version 1*/}
                           {/*   <DropdownButton*/}
                           {/*   title="Sort"*/}
                           {/*   id="dropdown-menu-align-right"*/}
                           {/*   onSelect={handleSelect}*/}
                           {/*     >*/}
                           {/*       {Array.from(dropdownOptions).map((item, i) => (*/}
                           {/*           <Dropdown.Item key={item} eventKey={i}>{item}</Dropdown.Item>*/}
                           {/*       ))}*/}
                           {/*   </DropdownButton>*/}
                        </div>
                        {/*version 1*/}
                        {/*{loading? <div>Loading Data...</div>:<RawTable data={tableData} />}*/}
                        {/*version 2*/}
                        {loading? <div></div>:Array.from(reformatComments).map((item, i)=>(<RawTable key={"instructorTable"+i} title={i} data={item}></RawTable>))}
                    </div>
                </div>

                <Button href={"/comments"} style={{marginTop:"1em"}} variant="light">Back to Comments Analysis</Button>
            </div>
        </>
    )
}

export default InstructorRawdata ;