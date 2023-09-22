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

let flowers = {
    "Iris-setosa": {
        "color": "#808040",
        "visible": true
    },
    "Iris-versicolor": {
        "color": "#408080",
        "visible": true
    },
    "Iris-virginica": {
        "color": "#8F4586",
        "visible": true
    }
}

const width = 500;
const height = 500;
const margin = 30;
const interval = (height - margin * 2) / 3;


const svg = d3.select("#parallel-coordinate-plots-chart");
const order = d3.select("#attribute-order");

renderChart();
renderAttributeOrder();

function reverseFlowerVisiblity(index) {
    flowers[index]["visible"] = !flowers[index]["visible"];
}

function swapAttributeOrder(index1, index2) {
    const temp = attributes[index1];
    attributes[index1] = attributes[index2];
    attributes[index2] = temp;
}

function renderAttributeOrder() {
    for (let i = 0; i < 4; i++) {
        order.select(`#attribute-order-text-${i}`)
            .text(attributes[i]["title"]);
    }
}

function renderChart() {
    // load csv file
    d3.csv("http://vis.lab.djosix.com:2023/data/iris.csv").then(function (data) {
        // remove old lines, axes, and axis titles
        svg.selectAll(".line").remove();
        svg.selectAll(".axis").remove();
        svg.selectAll(".axis-title").remove();

        // create d3.js axis objects
        const axes = [
            d3.scaleLinear()
                .domain(attributes[0]["domain"])
                .range([0, width - margin * 2]),
            d3.scaleLinear()
                .domain(attributes[1]["domain"])
                .range([0, width - margin * 2]),
            d3.scaleLinear()
                .domain(attributes[2]["domain"])
                .range([0, width - margin * 2]),
            d3.scaleLinear()
                .domain(attributes[3]["domain"])
                .range([0, width - margin * 2])
        ];

        // render axes
        for (let i = 0; i < 4; i++) {
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", `translate(${margin}, ${height - margin - interval * i})`)
                .call(d3.axisBottom(axes[i]));

            svg.append("text")
                .attr("class", "axis-title")
                .attr("transform", `translate(${margin}, ${height - margin - interval * i - 5})`)
                .text(attributes[i]["title"]);
        }

        // add lines
        for (let i = 0; i < 3; i++) {
            svg.append("g")
                .selectAll("line")
                .data(data)
                .join("line")
                .attr("class", "line")
                .attr("x1", function (d) { return axes[i](d[attributes[i]["name"]]) + margin; })
                .attr("y1", function (d) { return height - margin - interval * i; })
                .attr("x2", function (d) { return axes[i + 1](d[attributes[i + 1]["name"]]) + margin; })
                .attr("y2", function (d) { return height - margin - interval * (i + 1); })
                .style("stroke", function (d) {
                    if (flowers[d["class"]] && flowers[d["class"]]["visible"])
                        return flowers[d["class"]]["color"];
                    return undefined;
                })
                .style("stroke-width", "1");
        }
    });
}
