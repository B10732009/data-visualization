let labels = {
    "x": "sepal length",
    "y": "sepal length"
};

let colors = {
    "Iris-setosa": "#808040",
    "Iris-versicolor": "#408080",
    "Iris-virginica": "#5A5AAD"
};

const width = 350;
const height = 350;
const margin = 30;

const svg = d3.select("#scatter-plot-chart");

// render x-axis
const xScale = d3.scaleLinear()
    .domain([0, 8])
    .range([0, width - margin * 2]);
svg.append("g")
    .attr("transform", `translate(${margin}, ${height - margin})`)
    .call(d3.axisBottom(xScale));

// render y-axis
const yScale = d3.scaleLinear()
    .domain([0, 8])
    .range([height - margin * 2, 0]);
svg.append("g")
    .attr("transform", `translate(${margin}, ${margin})`)
    .call(d3.axisLeft(yScale));

// initially render chart
renderChart();

function setLabel(index, value) {
    labels[index] = value;
}

function renderChart() {
    // load csv file
    d3.csv("http://vis.lab.djosix.com:2023/data/iris.csv").then(function (data) {
        // remove old dots
        svg.selectAll(".dot").remove();
        
        // add new dots
        svg.append("g")
            .selectAll("dot")
            .data(data)
            .join("circle")
            .attr("class", "dot")
            .attr("cx", function (d) { return xScale(d[labels["x"]]) + margin; })
            .attr("cy", function (d) { return yScale(d[labels["y"]]) + margin; })
            .attr("r", 2.0)
            .style("fill", function (d) { return colors[d["class"]]; })
    });
}
