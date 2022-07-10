import React from "react";
import {Dropdown, DropdownButton, InputGroup} from "react-bootstrap";
import axios from "axios";
import {API} from "../service/api";

const Home = () =>{
    const containerStyle = {
        textAlign: "center",
        alignItems: "center",
        display: "block",
        width: "100vw",
        height: "100vh"
    }
    const titleStyle = {
        paddingTop: "30vh",
        paddingBottom: "5vh"
    }
    const selectStyle = {
        textAlign: "center",
        alignItems: "center",
        display: "contents",
    }

    const uid = sessionStorage.getItem("uid")

    const [userData, setUserData] = React.useState(null);
    const [semesterList, setSemesterList] = React.useState([]);
    const [semester, setSemester] = React.useState(null);
    const [courseList, setCourseList] = React.useState([])
    const [loading, setLoading] = React.useState(true);
    const [dropdownTitle, setDropdownTitle] = React.useState("Select Semester");
    const [courseTitle, setCourseTitle] = React.useState("Select Course");

    React.useEffect(() =>{
        axios({
            method: 'get',
            url: `${API}/Users/${uid}`,
            headers: {
              'Access-Control-Allow-Origin': '*',
                withCredentials: true
            },
        }).then((response)=>{
            setUserData(response.data)
            sessionStorage.setItem("userData", JSON.stringify(response.data))
            let tempList = []
            Object.entries(response.data).forEach(([key, value]) => {
               if (key != "username" && key!="id"){
                   tempList.push(key)
               }
            });
            setSemesterList(tempList);
        }).catch((error) =>{
            console.log(error)
        }).finally(() =>{
            setLoading(false)
        })
    }, [])

    React.useEffect(()=>{
        if(userData!=null){
            console.log(userData[semester])
            setCourseList(userData[semester])
        }
    }, [semester])

    return(
        <div style={containerStyle}>
            <div style={titleStyle}>
                <h2>Hi, {sessionStorage.getItem("username")}</h2>
                <h2 >Welcome to SETSum Dashboard</h2>
            </div>

            {loading?<div>Loading</div>:
                <InputGroup className="mb-3 search-box" style={selectStyle}>
                    <DropdownButton
                      variant="outline-secondary"
                      title={dropdownTitle}
                      id="input-group-dropdown-1"
                      onSelect={function (e){setSemester(e); setDropdownTitle(e)}}
                    >
                        {semesterList.map((item)=>(
                            <Dropdown.Item eventKey={item} key={item}>{item}</Dropdown.Item>
                        ))}
                      {/*<Dropdown.Divider />*/}
                      {/*<Dropdown.Item href="#">Separated link</Dropdown.Item>*/}
                    </DropdownButton>
                    {(semester==null)?<div></div>:
                        <DropdownButton
                      variant="outline-secondary"
                      title={courseTitle}
                      id="input-group-dropdown-2"
                      onSelect={function (e){setCourseTitle(e); sessionStorage.setItem("cid", e)}}
                    >
                            {courseList.map((item)=>(
                                <Dropdown.Item href="/rates" eventKey={item} key={item}>{item}</Dropdown.Item>
                            ))}
                    </DropdownButton>}

                  </InputGroup>}
        </div>
    )
}

export default Home;