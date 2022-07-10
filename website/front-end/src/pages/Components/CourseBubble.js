import React from "react";
import * as d3 from "d3"
import "../../styles/Bubble.css"
import axios from "axios";
import {API} from "../../service/api";
const cid = sessionStorage.getItem("cid")

const colors = {
    positive: '#83ce5c',
    negative: '#F16529',
    assignment: '#F16529',
    grading: '#1C88C7',
    workload: '#FCC700',
    generalFeeling: '#fff',
    instructor: '#fff',
    TA: '#fff',
    lab: '#fff',
    recitation: '#fff',
    courseDesign: '#fff',
    exam: '#fff',
    content: '#fff',
    participation: '#fff',
    groupWork: '#fff',
    resources: '#fff',
    lessonsLearned: '#fff',
    officeHour: '#fff',
    skills: '#fff',
    delivery: '#fff',
    personality: '#fff',
};

const Bubble = () =>{
    const bubbleRef = React.createRef();
    const tooltipRef = React.createRef();
    const [dimensions, setDimensions] = React.useState({
        height: window.innerHeight*0.9,
        width: window.innerWidth*0.9
      })

    const [loading, setLoading] = React.useState(true);

    const generateChart = (data, width, height) => {

    const div = d3.select(bubbleRef.current)
    const svg = div.append('svg')
        .attr("id","bubble-pack")

        svg.style('width', width)
            .style('height', height)

        const bubble = data => d3.pack()
            .size([width, height])
            .padding(10)(d3.hierarchy({ children: data }).sum(d => d.score));

        const root = bubble(data);
        const tooltip = d3.select(tooltipRef.current);

        const node = svg.selectAll()
            .data(root.children)
            .enter().append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const circle = node.append('circle')
            .style('fill', d => colors[d.data.sentiment])
            .on('mouseover', function (e, d) {
                tooltip.select('a').attr('href', d.data.link);
                tooltip.select('span').attr('class', d.data.category)
                    .html(function(){
                        let summary = `<h5 style="text-align: center; color: white">Top sentences related to ${d.data.name}</h5>`
                        summary += '<div style="text-align: left">'
                        let lines = d.data.summary.split("[SEP]")
                        lines.pop()
                        for (let i=0;i<lines.length;i++){
                            summary += (i+1) + ": " + lines[i] + "<br />"

                        }
                        summary += "<br /> <span style='color: white'>[click the bubble to view more details inside] </span><br />"
                        summary +='</div>'
                        return(summary)
                    }).style('text-align', 'left');
                tooltip.style('visibility', 'visible');
                tooltip.style('width', "35vw");
                tooltip.style('position', 'fixed');
                tooltip.style('top', '10vh');
                tooltip.style('right', '5vw');
                tooltip.style('background-color', '#afafaf');
                tooltip.style('padding', '2em')

                d3.select(this).style('stroke', '#222');
            })
            // .on('mousemove', e => tooltip.style('top', `${e.pageY}px`)
            //                              .style('left', `${e.pageX + 10}px`))
            .on('mouseout', function () {
                d3.select(this).style('stroke', 'none');
                return tooltip.style('visibility', 'hidden');
            })
            .on('click', (e, d) => {
                window.open(d.data.link,"_self")
                sessionStorage.setItem("category", d.data.category);
                sessionStorage.setItem("summary", d.data.summary);
            });

        const label = node.append('text')
            .attr('dy', 2)
            .style('text-anchor', 'middle')
            .style('font', '1em sans-serif')
            .style('pointer-events', "none")
            .style('opacity', 0)
            .text(d => d.data.name.substring(0, d.r / 3));

        node.transition()
            .ease(d3.easeExpInOut)
            .duration(1000)
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

        circle.transition()
            .ease(d3.easeExpInOut)
            .duration(1000)
            .attr('r', d => d.r);

        label.transition()
            .delay(700)
            .ease(d3.easeExpInOut)
            .duration(1000)
            .style('opacity', 1)
    };

    React.useEffect(() =>{
        function handleResize(){
              d3.select("#bubble-pack").remove();
              let container = document.getElementById("svg-container")
              setDimensions({
                height: container.clientHeight*1.1,
                width: container.clientWidth*1.1
              })
        }
        window.addEventListener('resize', handleResize)
    }, [])

    React.useEffect(() =>{
        if(sessionStorage.getItem("courseBubble")!=null){
            let bubbleData = JSON.parse(sessionStorage.getItem("courseBubble"))
            setLoading(false)
            generateChart(bubbleData, dimensions.width, dimensions.height)
        }else{
            axios({
              method: 'get',
              url: `${API}/Bubbles/course-${cid}`,
            }).then(function (response) {
                sessionStorage.setItem("courseBubble", JSON.stringify(response.data.data))
                setLoading(false)
            }).catch((error) =>{
                console.log(error)
            })
        }

    }, [dimensions, loading])

    // CourseHoverScatterData
    React.useEffect(()=>{
        if(sessionStorage.getItem("courseScatter")==null){
            axios({
              method: 'get',
              url: `${API}/Scatters/course-${cid}`,
            }).then(function (response) {
                  sessionStorage.setItem("courseScatter", JSON.stringify(response.data.data))
            })
        }
    },[])

    // InstructorHoverScatterData
    React.useEffect(()=>{
        if(sessionStorage.getItem("instructorScatter")==null){
            axios({
              method: 'get',
              url: `${API}/Scatters/instructor-${cid}`,
            }).then(function (response) {
                  sessionStorage.setItem("instructorScatter", JSON.stringify(response.data.data))
            })
        }
    },[])

    return(
        <div id={"svg-container"} style={{width: "90vw", height: "90vh"}}>
            {loading?<div>loading...</div>:<div ref={bubbleRef}></div>}
            <div ref={tooltipRef}>
                <div>
                    <a className={"bubble-link"}></a>
                    <span className={"bubble-text"}></span>
                </div>
            </div>
        </div>
    )

}

export default Bubble;