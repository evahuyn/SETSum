import Sidebar from "./Sidebar";
import {Button, Dropdown, DropdownButton, FormControl, InputGroup} from "react-bootstrap";
import account from "../Icons/account.png";
import React from "react";
import {signOut} from "../service/auth";
import {useHistory, useNavigate} from "react-router-dom";

const Topbar = ({ ...props }) =>{

    const navigate = useNavigate();

    const [semesterList, setSemesterList] = React.useState([]);
    const [semester, setSemester] = React.useState(null);
    const [courseList, setCourseList] = React.useState(null)
    const [dropdownTitle, setDropdownTitle] = React.useState("Select Semester");
    const [courseTitle, setCourseTitle] = React.useState("Select Course");

    let userData = JSON.parse(sessionStorage.getItem("userData"))
    React.useEffect(() =>{
        let tempList = []
        Object.entries(userData).forEach(([key, value]) => {
                   if (key != "username" && key!="id"){
                       tempList.push(key)
                   }
        });
        setSemesterList(tempList);
    }, [])

    React.useEffect(()=>{
        setCourseList(userData[semester])
    }, [semester])


    return(
        <div className={"topbar"}>
            <Sidebar {...props}/>
            <div className={"topbar-title"}>
                <div style={{fontSize: "1.5em"}}>Student Evaluation of Teaching Report</div>
                <div style={{fontSize: "1em"}}>University of North Carolina at Chapel Hill</div>
            </div>
            <InputGroup className="mb-3 search-box">
                    <DropdownButton
                      variant="outline-secondary"
                      title={dropdownTitle}
                      id="input-group-dropdown-1"
                      onSelect={function (e){setCourseList(userData[e]); setDropdownTitle(e); console.log(e)}}
                    >
                        {semesterList.map((item)=>(
                            <Dropdown.Item eventKey={item} key={item}>{item}</Dropdown.Item>
                        ))}
                    </DropdownButton>
                    {(courseList==null)?<div></div>:
                        <DropdownButton
                      variant="outline-secondary"
                      title={courseTitle}
                      id="input-group-dropdown-2"
                      onSelect={function (e){setCourseTitle(e);
                          sessionStorage.setItem("cid", e)
                          sessionStorage.removeItem("Infos")
                          sessionStorage.removeItem("CircleCR")
                          sessionStorage.removeItem("CircleIR")
                          sessionStorage.removeItem("CircleCC")
                          sessionStorage.removeItem("CircleIC")
                          sessionStorage.removeItem("PieCR")
                          sessionStorage.removeItem("PieIR")
                          sessionStorage.removeItem("PieCC")
                          sessionStorage.removeItem("PieIC")
                          sessionStorage.removeItem("courseRawData")
                          sessionStorage.removeItem("instructorRawData")
                          sessionStorage.removeItem("courseScatter")
                          sessionStorage.removeItem("instructorScatter")
                          sessionStorage.removeItem("courseBubble")
                          sessionStorage.removeItem("instructorBubble")
                      }}
                    >
                            {courseList.map((item)=>(
                                <Dropdown.Item href={"/rates"} eventKey={item} key={item}>{item}</Dropdown.Item>
                            ))}
                    </DropdownButton>}

                  </InputGroup>

            <div className={"topbar-instructor"}>
                <div style={{display: "flex", alignItems: "center"}}>{sessionStorage.getItem("username")}</div>
                <img src={account} style={{width:"2em", height:"2em"}}/>

                <Button onClick={signOut} style={{marginLeft: "1em"}} href={"/"}>Log out</Button>
            </div>

        </div>
    )
}

export default Topbar;