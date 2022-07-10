import {useState} from "react";
import {Button, Offcanvas} from "react-bootstrap";
import "../styles/Sidebar.css"
import menu from "../Icons/menu.png"

function Sidebar({ ...props }) {
  const [show, setShow] = useState(false);

  const sidebarColor = props.sidebarColor;
  const sidebarPic = props.sidebarPic;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const imgcss = {
      width: "8%"
  }

  return (
    <>
      <Button variant="primary" onClick={handleShow} className="me-2 menu-button">
          <img src={menu}/>
      </Button>
      <Offcanvas show={show} onHide={handleClose} {...props}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title style={{fontSize: "2em", paddingLeft: "30%"}}>SETSum</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
           <div className={"nav-block"}>
               <img src={sidebarPic[0]} style={imgcss}/>
               <a href={"/rates"}><div className={"label"} style={{color: sidebarColor[0]}}>Ratings Analysis</div></a>
           </div>

           <div className={"nav-block"}>
               <img src={sidebarPic[1]} style={imgcss}/>
               <a href={'/comments'}><div className={"label"} style={{color: sidebarColor[1]}}>Comments Analysis</div></a>
           </div>

           {/*<div className={"nav-block"}>*/}
           {/*    <img src={sidebarPic[2]} style={imgcss}/>*/}
           {/*    <a href={'/rawdata'} ><div className={"label"} style={{color: sidebarColor[2]}}>Raw Data</div></a>*/}
           {/*</div>*/}

           <div className={"nav-block"}>
               <img src={sidebarPic[3]} style={imgcss}/>
               <a href={'/account'} ><div className={"label"} style={{color: sidebarColor[3]}}>Account Setting</div></a>
           </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Sidebar