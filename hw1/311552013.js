let labels = {
    "x": "sepal length",
    "y": "sepal length"
};

let colors = {
    "Iris-setosa": "#808040",
    "Iris-versicolor": "#408080",
    "Iris-virginica": "#8F4586"
};

let attributeDomains = {
    "sepal length": [3, 9],
    "sepal width": [1, 5],
    "petal length": [0, 8],
    "petal width": [0, 4],
};

const width = 500;
const height = 500;
const margin = 30;

const svg = d3.select("#scatter-plot-chart");

// initially render chart
renderChart();

function setLabel(index, value) {
    labels[index] = value;
}

function renderChart() {
    // load csv file
    d3.csv("http://vis.lab.djosix.com:2023/data/iris.csv").then(function (data) {
        // remove old dots and axis
        svg.selectAll(".dot").remove();
        svg.selectAll(".axis").remove();

        // add x-axis
        const xScale = d3.scaleLinear()
            .domain(attributeDomains[labels["x"]])
            .range([0, width - margin * 2]);
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin}, ${height - margin})`)
            .call(d3.axisBottom(xScale));

        // add y-axis
        const yScale = d3.scaleLinear()
            .domain(attributeDomains[labels["y"]])
            .range([height - margin * 2, 0]);
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin}, ${margin})`)
            .call(d3.axisLeft(yScale));

        // add new dots
        svg.append("g")
            .selectAll("dot")
            .data(data)
            .join("circle")
            .attr("class", "dot")
            .attr("cx", function (d) { return xScale(d[labels["x"]]) + margin; })
            .attr("cy", function (d) { return yScale(d[labels["y"]]) + margin; })
            .attr("r", 3.5)
            .style("fill", function (d) { return colors[d["class"]]; })
    });
}
