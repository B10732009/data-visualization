let colors = {
    "Iris-setosa": "#808040",
    "Iris-versicolor": "#408080",
    "Iris-virginica": "#8F4586"
};

let attributes = [
    {
        "name": "sepal length",
        "title": "Sepal Length",
        "domain": [4.0, 8.0]
    },
    {
        "name": "sepal width",
        "title": "Sepal Width",
        "domain": [1.5, 4.5]
    },
    {
        "name": "petal length",
        "title": "Petal Length",
        "domain": [0.5, 7.0]
    },
    {
        "name": "petal width",
        "title": "Petal Width",
        "domain": [0.0, 3.0]
    }
];

const width = 1000;
const height = 1000;
const marginWidth = 60;
const marginHeight = 60;
const cellWidth = 220;
const cellHeight = 220;
const cellMarginWidth = 40;
const cellMarginHeight = 40;

const svg = d3.select("#brushable-scatter-plot-matrix-chart");

// initially render chart
renderChart();

function renderChart() {
    // load csv file
    d3.csv("http://vis.lab.djosix.com:2023/data/iris.csv").then(function (data) {
        // filter data to remove empty lines in the dataset
        const filteredData = data.filter(function (d) { return d["class"]; })

        // remove old dots and axis
        svg.selectAll(".dot").remove();
        svg.selectAll(".line").remove();
        svg.selectAll(".axis").remove();

        for (let i = 0; i < attributes.length; i++) {
            for (let j = 0; j < attributes.length; j++) {
                // add x-axis
                const xScale = d3.scaleLinear()
                    .domain(attributes[j].domain)
                    .range([0, cellWidth - cellMarginWidth]);
                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", `translate(${marginWidth + cellMarginWidth + j * cellWidth}, ${marginHeight + (i + 1) * cellHeight})`)
                    .call(d3.axisBottom(xScale));

                // add y-axis
                const yScale = d3.scaleLinear()
                    .domain(attributes[i].domain)
                    .range([cellHeight - cellMarginHeight, 0]);
                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", `translate(${marginWidth + cellMarginWidth + j * cellWidth}, ${marginHeight + cellMarginHeight + i * cellHeight})`)
                    .call(d3.axisLeft(yScale));

                // cell on the diagonal, add histograms
                if (i == j) {
                    svg.append("g")
                        .selectAll("line")
                        .data(data)
                        .join("line")
                        .attr("class", "line")
                        .attr("x1", function (d) { return xScale(d[attributes[j].name]) + marginWidth + cellMarginWidth + j * cellWidth; })
                        .attr("y1", function (d) { return marginHeight + (i + 1) * cellHeight; })
                        .attr("x2", function (d) { return xScale(d[attributes[j].name]) + marginWidth + cellMarginWidth + j * cellWidth; })
                        .attr("y2", function (d) { return yScale(d[attributes[i].name]) + marginHeight + cellMarginHeight + i * cellHeight; })
                        .style("stroke", function (d) { return colors[d["class"]]; })
                        .style("stroke-width", "4.0");
                }
                // cell not on the diagonal, add dots
                else {
                    svg.append("g")
                        .selectAll("dot")
                        .data(filteredData)
                        .join("circle")
                        .attr("class", "dot")
                        .attr("cx", function (d) { return xScale(d[attributes[j].name]) + marginWidth + cellMarginWidth + j * cellWidth; })
                        .attr("cy", function (d) { return yScale(d[attributes[i].name]) + marginHeight + cellMarginHeight + i * cellHeight; })
                        .attr("r", 3.5)
                        .style("fill", function (d) { return colors[d["class"]]; });
                }

                // cell on the upmost, add text
                if (i == 0) {
                    svg.append("text")
                        .attr("class", "axis-title")
                        .attr("transform", `translate(${marginWidth + cellMarginWidth + j * cellWidth}, ${marginHeight + cellMarginHeight / 2}) rotate(0)`)
                        .attr("font-size", "14px")
                        .text(attributes[j]["title"]);
                }
                // cell on the leftmost, add text
                if (j == 0) {
                    svg.append("text")
                        .attr("class", "axis-title")
                        .attr("transform", `translate(${marginWidth / 2}, ${marginHeight + cellMarginHeight + i * cellHeight}) rotate(90)`)
                        .attr("font-size", "14px")
                        .text(attributes[i]["title"]);
                }
            }
        }
    });
}
