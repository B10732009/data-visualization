let sex = "M";

const width = 1000;
const height = 500;
const marginWidth = 50;
const marginHeight = 25;
const cellWidth = 100;
const cellHeight = 50;

const svg = d3.select("#correlation-matrix-chart");

const attributes = [
    "Sex",
    "Length",
    "Diameter",
    "Height",
    "Whole Weight",
    "Shucked Weight",
    "Viscera Weight",
    "Shell Weight",
    "Rings"
];

const colors = [
    // negative
    "#804040",
    "#984B4B",
    "#AD5A5A",
    "#B87070",
    "#C48888",
    "#CF9E9E",
    "#D9B3B3",
    "#E1C4C4",
    "#EBD6D6",
    "#F2E6E6",
    "#F0F0F0",

    // positive
    "#F3F3FA",
    "#E6E6F2",
    "#D8D8EB",
    "#C7C7E2",
    "#B8B8DC",
    "#A6A6D2",
    "#9999CC",
    "#8080C0",
    "#7373B9",
    "#5A5AAD",
];

// initially render chart
renderChart();

function setSex(value) {
    sex = value;
}

function renderCell(i, j, text, color) {
    // add square
    svg
        .append("rect")
        .attr("x", i * cellWidth + marginWidth)
        .attr("y", j * cellHeight + marginHeight)
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("fill", color);

    // add text
    svg
        .append("text")
        .attr("x", (i + 0.5) * cellWidth + marginWidth)
        .attr("y", (j + 0.5) * cellHeight + marginHeight)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-size", "14px")
        .text(text);
}

function renderChart() {
    d3.text("http://vis.lab.djosix.com:2023/data/abalone.data").then(function (text) {
        // this csv file doesn't have header, so read it as text, add header, 
        // and read it as csv again
        const data = d3.csvParse(attributes.join(",") + "\n" + text);

        // filter data by sex
        const filteredData = data.filter(function (d) { return d["Sex"] == sex; })

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (i == 0 && j == 0) {
                    continue;
                }
                else if (i == 0) {
                    renderCell(i, j, `${attributes[j]}`, `#F0F0F0`);
                }
                else if (j == 0) {
                    renderCell(i, j, `${attributes[i]}`, `#F0F0F0`);
                }
                else {
                    // calculate correlation coefficient
                    let xsum = 0.0, ysum = 0.0;
                    for (let k = 0; k < filteredData.length; k++) {
                        xsum += parseFloat(filteredData[k][attributes[i]]);
                        ysum += parseFloat(filteredData[k][attributes[j]]);
                    }

                    const xavg = xsum / filteredData.length;
                    const yavg = ysum / filteredData.length;

                    let xxsum = 0.0, yysum = 0.0, xysum = 0.0;
                    for (let k = 0; k < filteredData.length; k++) {
                        xxsum += (parseFloat(filteredData[k][attributes[i]]) - xavg) *
                            (parseFloat(filteredData[k][attributes[i]]) - xavg);
                        yysum += (parseFloat(filteredData[k][attributes[j]]) - yavg) *
                            (parseFloat(filteredData[k][attributes[j]]) - yavg);
                        xysum += (parseFloat(filteredData[k][attributes[i]]) - xavg) *
                            (parseFloat(filteredData[k][attributes[j]]) - yavg);
                    }

                    const r = Math.round(xysum / Math.sqrt(xxsum * yysum) * 100) / 100;
                    renderCell(i, j, `${r}`, colors[Math.floor((r * 10)) + 10]);
                }
            }
        }
    });
}
