const currentcategory = sessionStorage.getItem("category")
const cid = sessionStorage.getItem("cid")

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["html","drawBubbles"], function*(html,drawBubbles)
{
  yield html`
    <div id="chart">
      <div id="tooltip"
      </div>
    </div>`;
  let scatterData = JSON.parse(sessionStorage.getItem("instructorScatter"))
  drawBubbles(scatterData.filter(item => item.category==currentcategory))
});
  main.variable("drawBubbles").define("drawBubbles", ["d3","width"], function(d3,width){return(
async function drawBubbles(data) {
  
  const dimensions = ({  
  height:window.innerHeight-200,
  width:window.innerWidth/2,
  margin: {
      top: 40,
      right: 30,
      bottom: 60,
      left: 30,
    } 
  })
  
  // const data = await d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/4_ThreeNum.csv")
  // console.log(data)
  // const data = instructorHoverScatterData.filter(item => item.category==currentcategory);
  console.log(data)
  
  const svg = d3.select("#chart")
  .append("svg")
    .attr("width", width-300)
    .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + dimensions.margin.left + "," + dimensions.margin.top + ")");  
  
  const x = d3.scaleLinear()
    .domain([0, 1])
    .range([ 0, width-600]);
  svg.append("g")
    .attr("transform", "translate(0," + dimensions.height + ")")
    .call(d3.axisBottom(x));   
  
  // Add X axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width/2-150)
      .attr("y", dimensions.height + 50 )
      .text("Sentiment");

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, 2])
    .range([ dimensions.height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));
  
  // Add Y axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", 10)
      .attr("y", 5)
      .text("Centrality")
      .attr("text-anchor", "start")
  
  // // Add a scale for bubble size
  // const z = d3.scaleSqrt()
  //   .domain([0, 1])
  //   .range([ 4, 40]);

  // Add a scale for bubble color
  const allgroups = ["positive", "negative"];
  const myColor = d3.scaleOrdinal()
    .domain(allgroups)
    .range(["#83ce5c", "#F16529"]);
  
  const tooltip = d3.select("#tooltip")
    .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "black")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white")  
  
  const showTooltip = function(d) {
    tooltip
      .transition()
      .duration(100)
    tooltip
      .style("opacity", 1)
      .html(d.comments)
      .style("left", (d3.mouse(this)[0]+180) + "px")
      .style("top", (d3.mouse(this)[1]+450) + "px")
  }
  const moveTooltip = function(d) {
    tooltip
      .style("left", (d3.mouse(this)[0]+180) + "px")
      .style("top", (d3.mouse(this)[1]+450) + "px")
  }
  const hideTooltip = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }  
  
  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", function(d) { return "bubbles " + d.sentiment})
      .attr("cx", function (d) { return x(d.sentimentScore); } )
      .attr("cy", function (d) { return y(d.centrality); } )
      // .attr("r", function (d) { return z(d.centrality); } )
      .attr("r", function (d) { return 30; } )
      .style("fill", function (d) { return myColor(d.sentiment); } )
    .on("mouseover", showTooltip )
    .on("mousemove", moveTooltip )
    .on("mouseleave", hideTooltip )
  
  // Add legend: circles
  //   const valuesToShow = [0.1, 0.5, 1]
  //   const xCircle = dimensions.width/2+200
  //   const xLabel = dimensions.width/2+250
  //
  //   svg.selectAll("legend")
  //     .data(valuesToShow)
  //     .enter()
  //     .append("circle")
  //       .attr("cx", xCircle)
  //       .attr("cy", function(d){ return dimensions.height - 40 - z(d) } )
  //       .attr("r", function(d){ return z(d) })
  //       .style("fill", "none")
  //       .attr("stroke", "black")
  //
  // svg.selectAll("legend")
  //     .data(valuesToShow)
  //     .enter()
  //     .append("line")
  //       .attr('x1', function(d){ return xCircle + z(d) } )
  //       .attr('x2', xLabel)
  //       .attr('y1', function(d){ return dimensions.height - 40 - z(d) } )
  //       .attr('y2', function(d){ return dimensions.height - 40 - z(d) } )
  //       .attr('stroke', 'black')
  //       .style('stroke-dasharray', ('2,2'))
  //
  // svg.selectAll("legend")
  //     .data(valuesToShow)
  //     .enter()
  //     .append("text")
  //       .attr('x', xLabel)
  //       .attr('y', function(d){ return dimensions.height - 40 - z(d) } )
  //       .text( function(d){ return d} )
  //       .style("font-size", 10)
  //       .attr('alignment-baseline', 'middle')
  //
  //  svg.append("text")
  //     .attr('x', dimensions.width/2+200)
  //     .attr("y", dimensions.height - 20)
  //     .text("Centrality")
  //     .attr("text-anchor", "middle")

  // What to do when one group is hovered
  const highlight = function(d){
    // reduce opacity of all groups
    d3.selectAll(".bubbles").style("opacity", .05)
    // expect the one that is hovered
    d3.selectAll("."+d).style("opacity", 1)
  }

  // And when it is not hovered anymore
  const noHighlight = function(d){
    d3.selectAll(".bubbles").style("opacity", 1)
  }  
    
  // Add one dot in the legend for each name.
    const size = 20
  console.log(dimensions.width)
    svg.selectAll("myrect")
      .data(allgroups)
      .enter()
      .append("circle")
        .attr("cx", dimensions.width+200)
        .attr("cy", function(d,i){ return i*(size+5)})
        .attr("r", 7)
        .style("fill", function(d){ return myColor(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
  
  // Add labels beside legend dots
    svg.selectAll("mylabels")
      .data(allgroups)
      .enter()
      .append("text")
        .attr("x", dimensions.width+200 + size*.8)
        .attr("y", function(d,i){ return i * (size + 5)})
        .style("fill", function(d){ return myColor(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
  
}
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<style>
.bubbles {
  stroke-width: 1px;
  stroke: white;
}
.bubbles:hover {
  stroke: black;
}

.tooltip {
    opacity: 0;
    position: absolute;
    top: -4px;
    left: 0;
    padding: 0.6em 1em;
    background: #fff;
    text-align: center;
    border: 1px solid #ddd;
    z-index: 10;
    transition: all 0.2s ease-out;
    pointer-events: none;
}
</style>`
)});
  main.variable().define(["md"], function(md){return(
md`Reference: https://www.d3-graph-gallery.com/graph/bubble_template.html`
)});
  main.variable("d3").define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
