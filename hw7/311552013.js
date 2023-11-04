const width = 1200;
const height = 16000;
const margin = 60;
const interval = 100;
const intervalMargin = 50;

const svg = d3.select("#horizon-chart");

let year = 2017;
let band = 1;
const bandColors = {
    "SO2": ["#D9B3B3", "#C48888", "#AD5A5A", "#804040", "#613030"],
    "NO2": ["#CDCD9A", "#B9B973", "#A5A552", "#808040", "#616130"],
    "O3": ["#A3D1D1", "#81C0C0", "#5CADAD", "#408080", "#336666"],
    "CO": ["#FFAF60", "#FF9224", "#EA7500", "#BB5E00", "#844200"],
    "PM10": ["#C7C7E2", "#A6A6D2", "#8080C0", "#5A5AAD", "#484891"],
    "PM2.5": ["#D2A2CC", "#C07AB8", "#AE57A4", "#8F4586", "#6C3365"]
};

const pollutants = ["SO2", "NO2", "O3", "CO", "PM10", "PM2.5"];
const pollutantDomains = { "SO2": 0.01, "NO2": 0.1, "O3": 0.05, "CO": 2.0, "PM10": 200, "PM2.5": 200 };

renderChart();

function selectYear() {
    year = parseInt(d3.select("#year").property("value"));
}

function selectBandNumber() {
    band = parseInt(d3.select("#band-number").property("value"));
}

function renderChart() {
    // remove old elements
    svg.selectAll(".path").remove();
    svg.selectAll(".axis").remove();
    svg.selectAll(".text").remove();
    svg.selectAll(".rect").remove();

    // load data
    d3.csv("http://vis.lab.djosix.com:2023/data/air-pollution.csv").then(function (data) {
        console.log("Finish loading data.");

        // get the data of specific year
        const filteredData = data.filter(function (d) { return d["Measurement date"].split("-")[0] == year; });

        /*
            transform the data to following format :
            {
                pollutant: {
                    district: {
                        time: [value, value...],
                        time: [value, value...],
                        time: [value, value...],
                    },
                    district: {
                        time: [value, value...],
                        time: [value, value...],
                        time: [value, value...],
                    },
                }...
            }
        */
        let transformedData = { "SO2": {}, "NO2": {}, "O3": {}, "CO": {}, "PM10": {}, "PM2.5": {} };
        for (let i = 0; i < filteredData.length; i++) {
            for (let j = 0; j < pollutants.length; j++) {
                if (transformedData[pollutants[j]][filteredData[i]["Address"]]) {
                    if (transformedData[pollutants[j]][filteredData[i]["Address"]][filteredData[i]["Measurement date"].split(" ")[0]]) {
                        transformedData[pollutants[j]][filteredData[i]["Address"]][filteredData[i]["Measurement date"].split(" ")[0]]
                            .push(Math.max(parseFloat(filteredData[i][pollutants[j]]), 0.0)); // deal with minus values
                    }
                    else {
                        transformedData[pollutants[j]][filteredData[i]["Address"]][filteredData[i]["Measurement date"].split(" ")[0]] = [
                            Math.max(parseFloat(filteredData[i][pollutants[j]]), 0.0)
                        ];
                    }
                }
                else {
                    let temp = {};
                    temp[filteredData[i]["Measurement date"].split(" ")[0]] = [
                        Math.max(parseFloat(filteredData[i][pollutants[j]]), 0.0)
                    ];
                    transformedData[pollutants[j]][filteredData[i]["Address"]] = temp;
                };
            }
        }

        // render charts
        let cnt = 0; // number of charts that have been rendered
        for (let ikey in transformedData) { // 6
            for (let jkey in transformedData[ikey]) { // 25
                // get average values of each date
                let avgData = [];
                for (let kkey in transformedData[ikey][jkey]) { // 365
                    avgData.push({
                        date: new Date(kkey),
                        value: d3.mean(transformedData[ikey][jkey][kkey])
                    });
                }

                // add x-axis
                const xScale = d3.scaleTime()
                    .domain([new Date(`${year}-01-01`), new Date(`${year}-12-31`)])
                    .range([0, width - margin * 2]);
                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", `translate(${margin}, ${margin + interval * (cnt + 1) - intervalMargin})`)
                    .call(d3.axisBottom(xScale).ticks(10));

                // add y-axis
                const yScale = d3.scaleLinear()
                    .domain([0, pollutantDomains[ikey] / band])
                    .range([interval - intervalMargin, 0]);
                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", `translate(${margin}, ${margin + interval * cnt})`)
                    .call(d3.axisLeft(yScale).ticks(4));

                // add color-value side bars
                for (let k = 0; k < band; k++) {
                    svg.append("rect")
                        .attr("class", "rect")
                        .attr("x", width - margin + 5)
                        .attr("y", margin + interval * cnt + ((interval - intervalMargin) / band) * k)
                        .attr("width", 6)
                        .attr("height", (interval - intervalMargin) / band)
                        .attr("fill", bandColors[ikey][k]);

                    svg.append("text")
                        .attr("class", "text")
                        .attr("x", width - margin + 15)
                        .attr("y", margin + interval * cnt + ((interval - intervalMargin) / band) * k)
                        .attr("text-anchor", "left")
                        .attr("dy", "0.35em")
                        .attr("font-size", "12px")
                        .text(`${(pollutantDomains[ikey] / band * k).toFixed(3)}`);
                }

                svg.append("text")
                    .attr("class", "text")
                    .attr("x", width - margin + 15)
                    .attr("y", margin + interval * cnt + ((interval - intervalMargin) / band) * band)
                    .attr("text-anchor", "left")
                    .attr("dy", "0.35em")
                    .attr("font-size", "12px")
                    .text(`${(pollutantDomains[ikey] / band * band).toFixed(3)}`);

                // add main data 
                for (let k = 0; k < band; k++) {
                    svg.append("path")
                        .attr("class", "path")
                        .datum(avgData)
                        .attr("fill", bandColors[ikey][k])
                        .attr("d", d3.area()
                            .x(function (d) { return xScale(d.date); })
                            .y0(yScale(0))
                            .y1(function (d) { return yScale(Math.min(Math.max(d.value - pollutantDomains[ikey] / band * k, 0), pollutantDomains[ikey] / band)); })
                        )
                        .attr("transform", `translate(${margin}, ${margin + interval * cnt})`);
                }

                // add title
                svg.append("text")
                    .attr("class", "text")
                    .attr("x", margin)
                    .attr("y", margin + interval * cnt - 20)
                    .attr("text-anchor", "left")
                    .attr("dy", "0.35em")
                    .attr("font-size", "14px")
                    .text(`${jkey} - ${ikey}`);

                cnt++;
            }
        }

        console.log("Finish rendering charts.");
    });
}
