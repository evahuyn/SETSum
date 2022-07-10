const Courseinfos = ({course}) =>{

    const blockstyle = {
        textAlign: "left",
        paddingLeft: "10em",
        paddingTop: "2em"
    }
    return(
        <div style={blockstyle}>
            <h2>{course.name}</h2>
            <div>{course.school} <br />
                Instructor: {course.instructor} <br />
                {course.semester}
            </div>

        </div>
    )
}

export default Courseinfos;