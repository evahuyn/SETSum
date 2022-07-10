// https://observablehq.com/@bayre/svg-swatches@750
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# SVG swatches

An alternative to [Mike Bostock's HTML swatches](https://observablehq.com/@d3/color-legend#swatches). This approach uses [\`getBBox\`](https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement/getBBox) to compute label length. It can't yet handle multiple rows.`
)});
  main.variable(observer()).define(["swatches","d3"], function(swatches,d3){return(
swatches({
  colour: d3.scaleOrdinal(["<10", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "≥80"],       d3.schemeSpectral[10])
})
)});
  main.variable(observer()).define(["swatches","d3"], function(swatches,d3){return(
swatches({
  colour: d3.scaleOrdinal(["blueberries with redundant text", "oranges with redundant text", "apples with redundant text"], d3.schemeCategory10),
  labelFormat: l => l.replace("with redundant text", "")
})
)});
  main.variable(observer()).define(["swatches","d3"], function(swatches,d3){return(
swatches({
  colour: d3.scaleOrdinal(["One really big label", "And another"], ["gold", "slateblue"]),
  swatchRadius: 20,
  labelFont: "italic 40px serif"
})
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---

## Implementation`
)});
  main.variable(observer("swatches")).define("swatches", ["getLabelLength","d3"], function(getLabelLength,d3){return(
function swatches({
  colour,
  swatchRadius = 6,
  swatchPadding = swatchRadius * (2/3),
  labelFont = "12px sans-serif",
  labelFormat = x => x,
  labelPadding = swatchRadius * 1.5,
  marginLeft = 0
} = {}) {
  
  const spacing = colour
    .domain()
    .map(d => labelFormat(d))
    .map(d => getLabelLength(d, labelFont) + (swatchRadius * 2) + swatchPadding + labelPadding)
    .map((_, i, g) => d3.cumsum(g)[i] + marginLeft)
  
  const width = d3.max(spacing)
  const height = swatchRadius * 2 + swatchPadding * 2
  
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible")
    .style("display", "block");
  
  const g = svg
    .append("g")
      .attr("transform", `translate(0, ${height / 2})`)
    .selectAll("g")
    .data(colour.domain())
    .join("g")
      .attr("transform", (d, i) => `translate(${spacing[i - 1] || marginLeft}, 0)`);
  
  g.append("circle")
      .attr("fill", colour)
      .attr("r", swatchRadius)
      .attr("cx", swatchRadius)
      .attr("cy", 0);
  
  g.append("text")
      .attr("x", swatchRadius * 2 + swatchPadding)
      .attr("y", 0)
      .attr("dominant-baseline", "central")
      .style("font", labelFont)
      .text(d => labelFormat(d));
  
  return svg.node()
  
}
)});
  main.variable(observer("getLabelLength")).define("getLabelLength", ["DOM","html"], function(DOM,html){return(
(label, labelFont = "12px sans-serif") => {
  const id = DOM.uid("label").id;
  const svg = html`<svg>
    <style> .${id} { font: ${labelFont} } </style>
    <g id=${id}>
      <text class="${id}">${DOM.text(label)}</text>
    </g>
  </svg>`;

  // Add the SVG element to the DOM so we can determine its size.
  document.body.appendChild(svg);

  // Compute the bounding box of the content.
  const width = svg.getElementById(id).getBBox().width;

  // Remove the SVG element from the DOM.
  document.body.removeChild(svg);

  return width;
}
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5", "d3-array@2.4")
)});
  return main;
}
