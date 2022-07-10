import axios from "axios";
import {commentsRate} from "../Components/DataHelperFn";
import {API} from "../../service/api";
const PieBinaryColor = ["rgb(241, 101, 41)", "rgb(131,206,92)"];
const cid = sessionStorage.getItem("cid")

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer("chart")).define("chart", ["pie","data","d3","width","height","color","arc"], function(pie,data,d3,width,height,color,arc)
{
  
  const arcs = pie(data);
  const svg = d3.create("svg")
      .attr("viewBox", [-width / 3, -height / 1.2, width, height * 2]);

  svg.append("g")
      .attr("stroke", "white")
    .selectAll("path")
    .data(arcs)
    .join("path")
      .attr("fill", d => color(d.data.name))
      .attr("d", arc)
    .append("title")
      .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);

  svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 40)
      .attr("text-anchor", "middle")
    .selectAll("text")
    .data(arcs)
    .join("text")
      .attr("transform", d => {
        const _d = arc.centroid(d);
        if((d.endAngle - d.startAngle) <= 0.35) {
          _d[0] *= 2.2;
          _d[1] *= 2.2;
        } else {
          _d[0] *= 0.9;
          _d[1] *= 0.9;
        }
        return `translate(${_d})`;
      })
       .call(text => text.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .attr("fill", d => (d.endAngle - d.startAngle) <= 0.35 ? color(d.data.name) : "#000")
            .text(d => d.data.value))
        .call(text => text.append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .attr("fill", d => (d.endAngle - d.startAngle) <= 0.35 ? color(d.data.name) : "#000")
            .text(d => (~~((d.endAngle - d.startAngle) / (2 * Math.PI) * 10000)) / 100 + '%'));


  
  var legendRectSize = 30;
  var legendSpacing = 30;
  var enteringLabels  = svg.selectAll('.legend') 
  .data(color.domain()) 
  .enter()
    
  var lg = enteringLabels.append('g') 
  .attr('class', 'legend')
  .attr("font-size", 40)
  .attr('transform', function(d, i) {                   
    var height = legendRectSize + legendSpacing; 
    var offset =  height * color.domain().length / 2; 
    var horz = 15 * legendRectSize;
    var vert = i * height - offset; 
      return 'translate(' + horz + ',' + vert + ')'; 
   })
  
  lg.append('rect') 
  .attr('width', legendRectSize) 
  .attr('height', legendRectSize) 
  .style('fill', (i) => { if(typeof i === 'number') {data[i+1].color = color(i);} return color(i);})
  .style('stroke', color)
  
  
  var labelGroups = enteringLabels.append('g').attr('class', 'label').data(arcs);
  var lines = labelGroups.append('line').attr('x1', function(d, i) {
    const _d = arc.centroid(d);
    return _d[0];
  }).attr('y1', function(d) {
    const _d = arc.centroid(d);
    return _d[1];
  }).attr('x2', function(d) {
    const _d = arc.centroid(d);
    const midAngle = Math.atan2(_d[1], _d[0]);
    return Math.cos(midAngle) * 240;
  }).attr('y2', function(d) {
    const _d = arc.centroid(d);
    const midAngle = Math.atan2(_d[1], _d[0]);
    return Math.sin(midAngle) * 240;
  }).attr('class','label-line').attr('stroke', function(d, i) {
    return color(i-1);
  }).filter(d => {
        const _d = arc.centroid(d);
        return (d.endAngle - d.startAngle) > 0.35;
  }).attr('style','display: none;')

  /**/
  lg.append('text')                                    
  .attr('x', legendRectSize + legendSpacing)
  .attr('y', legendRectSize)
  .text(function(d) { return d; });

  return svg.node();
}
);
  const pieComments = JSON.parse(sessionStorage.getItem("PieIC"))
      main.variable("data").define("data", function(){return(pieComments
    )});
  main.variable("color").define("color", ["d3","data"], function(d3,data){return(
d3.scaleOrdinal()
    .domain(data.map(d => d.name))
    .range(d3.quantize(t => d3.interpolateRgbBasis(PieBinaryColor)(t), data.length))
)});
  main.variable("height").define("height", ["width"], function(width){return(
Math.min(width, 450)
)});
  main.variable("arc").define("arc", ["d3","width","height"], function(d3,width,height){return(
d3.arc()
    .innerRadius(0)
    .outerRadius(Math.min(width, height)/1.5 - 1)
)});
  main.variable("arcLabel").define("arcLabel", ["width","height","d3"], function(width,height,d3)
{
  const radius = Math.min(width, height) / 2 * 0.8;
  return d3.arc().innerRadius(radius).outerRadius(radius);
}
);
  main.variable("pie").define("pie", ["d3"], function(d3){return(
d3.pie()
    .sort(null)
    .value(d => d.value)
)});
  main.variable("d3").define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
