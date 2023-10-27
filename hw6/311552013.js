let streams = [
    "house-2",
    "house-3",
    "house-4",
    "house-5",
    "unit-1",
    "unit-2",
    "unit-3"
];

const streamsColors = {
    "house-2": "#FF0000",
    "house-3": "#FF8000",
    "house-4": "#C4C400",
    "house-5": "#73BF00",
    "unit-1": "#005AB5",
    "unit-2": "#2828FF",
    "unit-3": "#6F00D2"
};

const width = 1000;
const height = 500;
const margin = 60;

const svg = d3.select("#theme-river-chart");
const order = d3.select("#stream-order");

renderChart();
renderStreamOrder();

/*
    transform date string to float: year + (March -> 0.25, June -> 0.5, September -> 0.75, December -> 1.0)
*/
function dateToFloat(date) {
    const splittedDate = date.split("/");
    return parseFloat(splittedDate[2]) + parseFloat(splittedDate[1]) / 12.0;
}

function swapStreamOrder(index1, index2) {
    const temp = streams[index1];
    streams[index1] = streams[index2];
    streams[index2] = temp;
}

function renderStreamOrder() {
    for (let i = 0; i < streams.length; i++) {
        const temp = streams[i].split("-");
        order.select(`#stream-order-text-${i}`)
            .style("background-color", streamsColors[streams[i]])
            .text(`Type: ${temp[0]} Bedrooms: ${temp[1]}`);
    }
}

function renderChart() {
    d3.csv("http://vis.lab.djosix.com:2023/data/ma_lga_12345.csv").then(function (data) {
        // remove old axes and paths
        svg.selectAll(".path").remove();
        svg.selectAll(".axis").remove();

        // transform data structures
        let transformedData = [];
        for (let i = 0; i < data.length; i++) {
            let found = false;
            for (let j = 0; j < transformedData.length; j++) {
                // check if the date is in the array
                // if it is, store the values {type-bedrooms: MA} into array
                if (transformedData[j]["saledate"] == dateToFloat(data[i]["saledate"])) {
                    transformedData[j][`${data[i]["type"]}-${data[i]["bedrooms"]}`] = data[i]["MA"];
                    found = true;
                    break;
                }
            }

            // if the date isn't in the array
            // create a new dictionary
            if (!found) {
                let newDictionary = {};
                // set the values of all types to 0 to avoid NaN in the array
                for (let j = 0; j < streams.length; j++) {
                    newDictionary[streams[j]] = 0.0;
                }
                newDictionary["saledate"] = dateToFloat(data[i]["saledate"]);
                newDictionary[`${data[i]["type"]}-${data[i]["bedrooms"]}`] = data[i]["MA"];
                transformedData.push(newDictionary);
            }
        }

        // sort the transformed data by date
        transformedData.sort(function (a, b) { return a["saledate"] - b["saledate"]; });

        // add x-axis
        const xScale = d3.scaleLinear()
            .domain(d3.extent(transformedData, function (d) { return d["saledate"]; }))
            .range([margin, width - margin]);
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height - margin})`)
            .call(d3.axisBottom(xScale).ticks(10));

        // add y-axis
        const yScale = d3.scaleLinear()
            .domain([25e5, -25e5])
            .range([margin, height - margin]);
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin}, 0)`)
            .call(d3.axisLeft(yScale));

        // add areas
        const stackedData = d3.stack().offset(d3.stackOffsetSilhouette).keys(streams)(transformedData);

        svg.selectAll("area")
            .data(stackedData)
            .join("path")
            .style("fill", function (d) { return streamsColors[d.key]; })
            .attr("class", function (d) { return `path ${d.key}`; })
            .attr("d", d3.area()
                .x(function (d, i) { return xScale(d.data["saledate"]); })
                .y0(function (d) { return yScale(d[0]); })
                .y1(function (d) { return yScale(d[1]); })
            )
            .on("mouseover", function (e, d) {
                const stream = d.key;
                d3.selectAll(".path").style("opacity", 0.2);
                d3.selectAll(`.${stream}`).style("opacity", 1);
            })
            .on("mouseleave", function (e, d) {
                d3.selectAll(".path").style("opacity", 1);
            });
    });
}
