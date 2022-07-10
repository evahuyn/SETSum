function Sidebox({ ...props }){
    const sidebarPic = props.sidebarPic;
    const imgcss = {
      width: "7%",
        margin: "0.2em"
    }

    const boxcss = {
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        left: "-15em",
        padding: "0.5em"
    }

    return(
        <div style={boxcss}>
            <a href={"/rates"}><img src={sidebarPic[0]} style={imgcss}/></a>
            <a href={'/comments'}><img src={sidebarPic[1]} style={imgcss}/></a>
            <a href={'/account'}><img src={sidebarPic[3]} style={imgcss}/></a>
        </div>
    )
}

export default Sidebox;