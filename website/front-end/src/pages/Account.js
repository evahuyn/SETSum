import React from "react";
import Topbar from "./Topbar"
import Courseinfos from "./Components/Courseinfos";
import stats from "../Icons/statistics.png";
import comments from "../Icons/comment.png";
import rawdata from "../Icons/data-storage.png";
import user from "../Icons/user_blue.png";
import Sidebox from "./Components/Sidebox";

const Account = () =>{

    const sidebarColor = ["#000", "#000", "#000", "#57bbeb"]
    const sidebarPic = [stats, comments, rawdata, user]

    return(
        <>
            <Topbar sidebarColor={sidebarColor} sidebarPic={sidebarPic} />
            <div className={"background-block"}>
                <Sidebox sidebarPic={sidebarPic}/>
                <div className={"row-block"}>
                    <div className={"sub-block"} style={{width: "-webkit-fill-available"}}>

                    </div>
                </div>

            </div>
        </>
    )
}

export default Account;