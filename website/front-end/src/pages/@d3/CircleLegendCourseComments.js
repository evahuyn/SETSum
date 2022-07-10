import define1 from "./CircleLegend_helper.js";

export default function define(runtime, observer) {
  const main = runtime.module();

  const circleLegendComments = JSON.parse(sessionStorage.getItem("CircleCC"))
  const circleLegendData = circleLegendComments.data
    main.variable(observer()).define(["circleLegend","d3"], function(circleLegend,d3){return(
  circleLegend({
    scale: d3.scaleSqrt().domain([0, 100]).range([0, 100]),
    fill: d3.scaleSequentialSqrt([0, 100], d3.interpolateViridis),
    // add data here
    tickValues: circleLegendComments.tickValues,
    tickFormat: (d, i) => [circleLegendData[0] + " enrolled students in the course (100%)", circleLegendData[1] + " enrolled students (" + d + "%) answered this question"][i],
    marginLeft: 30
  }))});

  main.variable("circleLegend").define("circleLegend", ["d3","getLines"], function(d3,getLines){return(
function circleLegend({
  scale,
  fill = "none",
  stroke = "black",
  marginTop = 5,
  marginRight = window.innerWidth*0.25,
  marginBottom = 10,
  marginLeft = 1,
  ticks = 3,
  tickSize = 5,
  tickFormat = d => d,
  tickValues,
  tickStroke = "currentColor",
  tickStrokeDash = "4, 2",
  tickFont = "12px sans-serif",
  tickWrap = true,
  tickWrapSpacing = 12,
} = {}) {
  
  ticks = tickValues || scale.ticks(ticks);
  const r = scale(d3.max(ticks))
  const width = r * 2 + marginRight
  const height = r * 2 + marginBottom
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-marginLeft, -marginTop, width, height])
      .attr("overflow", "visible")
  
  svg.selectAll("circle")
    .data(ticks)
    .join("circle")
      .sort((a, b) => b - a)
      .attr("fill", fill)
      .attr("stroke", stroke)
      .attr("cx", r)
      .attr("cy", scale)
      .attr("r", scale)
  
  svg.selectAll("line")
    .data(ticks)
    .join("line")
      .attr("stroke", tickStroke)
      .attr("stroke-dasharray", tickStrokeDash)
      .attr("x1", r)
      .attr("x2", tickSize + r * 2)
      .attr("y1", d => scale(d) * 2)
      .attr("y2", d => scale(d) * 2);
  
  const ticksFormatted = ticks
    .map((d, i, g) => ({d, text: tickFormat(d, i, g)}))
    .map(d => ({ ...d, lines: getLines(d.text, marginRight - (tickSize + 3), tickFont)}))
  
  const tickLabels = svg.selectAll("text")
    .data(ticksFormatted)
    .join("text")
      .attr("transform", ({d}) => `translate(${r * 2 + tickSize + 3}, ${scale(d) * 2})`)
      .style("font", tickFont)
  
  if (tickWrap) {
    tickLabels
      .selectAll("tspan")
      .data(d => d.lines)
      .join("tspan")
        .attr("x", 0)
        .attr("y", (d, i, g) => (i - g.length / 2 + 0.8) * tickWrapSpacing)
        .text(d => d.text);
  } else {
    tickLabels
        .attr("dominant-baseline", "middle")
        .text(d => d.text)
  }
  
  return svg.node()

}
)});
  main.variable("getPackScale").define("getPackScale", ["d3"], function(d3){return(
(pack) => {
  const root = pack.leaves()
  return d3.scaleSqrt()
    .domain(d3.extent(root, d => d.value))
    .range(d3.extent(root, d => d.r))
}
)});
  main.variable("getLines").define("getLines", ["getLabelLength"], function(getLabelLength){return(
(text, targetWidth, textStyle = "12px sans-serif") => {
  const words = text.toString().split(/\s+/g); // To hyphenate: /\s+|(?<=-)/
  if (!words[words.length - 1]) words.pop();
  if (!words[0]) words.shift();
  let line;
  let lineWidth0 = Infinity;
  const lines = [];
  for (let i = 0, n = words.length; i < n; ++i) {
    let lineText1 = (line ? line.text + " " : "") + words[i];
    let lineWidth1 = getLabelLength(lineText1, textStyle);
    if ((lineWidth0 + lineWidth1) / 2 < targetWidth) {
      line.width = lineWidth0 = lineWidth1;
      line.text = lineText1;
    } else {
      lineWidth0 = getLabelLength(words[i], textStyle);
      line = {width: lineWidth0, text: words[i]};
      lines.push(line);
    }
  }
  return lines;
}
)});
  const child1 = runtime.module(define1);
  main.import("getLabelLength", child1);
  main.variable("d3").define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
