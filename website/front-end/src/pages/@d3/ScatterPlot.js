export default function define(runtime, observer) {
  const main = runtime.module();
//   main.variable(observer()).define(["md"], function(md){return(
// md`# Scatterplot Tour
//
// This notebook implements an animated tour of a scatterplot using zoom transitions. The tour zooms in on each cluster’s [bounding box](/@d3/zoom-to-bounding-box) in succession before zooming back out to the overview. To improve rendering performance, the circles are drawn as zero-length strokes with round caps.`
// )});
  main.variable(observer("viewof transform")).define("viewof transform", ["html","transforms","invalidation"], function(html,transforms,invalidation)
{
  const form = html`<form style="font: 12px var(--sans-serif); display: flex; height: 33px; align-items: center;">
  ${transforms.map(([name, transform], i) => html`<label style="margin-right: 1em; display: inline-flex; align-items: center;">
    <input type="radio" name="radio" value="${i}" style="margin-right: 0.5em;" ${i === 0 ? "checked" : ""}> ${name}
  </label>`)}
</form>`;
  const timeout = setInterval(() => {
    form.value = transforms[form.radio.value = (+form.radio.value + 1) % transforms.length][1];
    form.dispatchEvent(new CustomEvent("input"));
  }, 2500);
  form.onchange = () => form.dispatchEvent(new CustomEvent("input")); // Safari
  form.oninput = event => { 
    // eslint-disable-next-line no-unused-expressions
    if (event.isTrusted) clearInterval(timeout), form.onchange = null;
    form.value = transforms[form.radio.value][1];
  };
  form.value = transforms[form.radio.value][1];
  invalidation.then(() => clearInterval(timeout));
  return form;
}
);
  main.variable("transform").define("transform", ["Generators", "viewof transform"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["d3","width","height","data","x","y","z","viewof transform","xAxis","yAxis"], function(d3,width,height,data,x,y,z,$0,xAxis,yAxis)
{
  const zoom = d3.zoom()
      .on("zoom", zoomed);

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  const g = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-linecap", "round");

  g.selectAll("path")
    .data(data)
    .join("path")
      .attr("d", d => `M${x(d[0])},${y(d[1])}h0`)
      .attr("stroke", d => z(d[2]));

  const gx = svg.append("g");

  const gy = svg.append("g");

  svg.call(zoom.transform, $0.value);

  function zoomed(event) {
    const {transform} = event;
    g.attr("transform", transform).attr("stroke-width", 5 / transform.k);
    gx.call(xAxis, transform.rescaleX(x));
    gy.call(yAxis, transform.rescaleY(y));
  }

  return Object.assign(svg.node(), {
    update(transform) {
      svg.transition()
          .duration(1500)
          .call(zoom.transform, transform);
    }
  });
}
);
  main.variable("animation").define(["chart","transform"], function(chart,transform){return(
chart.update(transform)
)});
  main.variable("data").define("data", ["d3"], function(d3)
{
  const random = d3.randomNormal(0, 0.2);
  const sqrt3 = Math.sqrt(3);
  return [].concat(
    Array.from({length: 100}, () => [random() + sqrt3, random() + 1, 'workload']),
    Array.from({length: 300}, () => [random() - sqrt3, random() + 1, 'grading']),
    Array.from({length: 50}, () => [random(), random() - 1, 'course design']),
    Array.from({length: 500}, () => [random(), random() + 1, 'instructor'])
  );
}
);
  main.variable("transforms").define("transforms", ["d3","data","x","y","width","height"], function(d3,data,x,y,width,height){return(
[["Overview", d3.zoomIdentity]].concat(d3.groups(data, d => d[2]).map(([key, data]) => {
  const [x0, x1] = d3.extent(data, d => d[0]).map(x);
  const [y1, y0] = d3.extent(data, d => d[1]).map(y);
  const k = 0.9 * Math.min(width / (x1 - x0), height / (y1 - y0));
  const tx = (width - k * (x0 + x1)) / 2;
  const ty = (height - k * (y0 + y1)) / 2;
  return [`${key}`, d3.zoomIdentity.translate(tx, ty).scale(k)];
}))
)});
  main.variable("x").define("x", ["d3","width"], function(d3,width){return(
d3.scaleLinear()
    .domain([-4.5, 4.5])
    .range([0, width])
)});
  main.variable("y").define("y", ["d3","k","height"], function(d3,k,height){return(
d3.scaleLinear()
    .domain([-4.5 * k, 4.5 * k])
    .range([height, 0])
)});
  main.variable("z").define("z", ["d3","data"], function(d3,data){return(
d3.scaleOrdinal()
    .domain(data.map(d => d[2]))
    .range(d3.schemeCategory10)
)});
  main.variable("xAxis").define("xAxis", ["height","d3"], function(height,d3){return(
(g, x) => g
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisTop(x).ticks(12))
    .call(g => g.select(".domain").attr("display", "none"))
)});
  main.variable("yAxis").define("yAxis", ["d3","k"], function(d3,k){return(
(g, y) => g
    .call(d3.axisRight(y).ticks(12 * k))
    .call(g => g.select(".domain").attr("display", "none"))
)});
  main.variable("k").define("k", ["height","width"], function(height,width){return(
height / width
)});
  main.variable("height").define("height", function(){return(
600
)});
  main.variable("d3").define("d3", ["require"], function(require){return(
require("d3@6")
)});
  return main;
}
