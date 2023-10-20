const criteria = [
    "scores_overall",
    "scores_teaching",
    "scores_research",
    "scores_citations",
    "scores_industry_income",
    "scores_international_outlook"
];

const colors = {
    "scores_teaching": "#FF0000",
    "scores_research": "#FF8000",
    "scores_citations": "#C4C400",
    "scores_industry_income": "	#73BF00",
    "scores_international_outlook": "#005AB5"
};

const width = 1000;
const height = 50000;
const margin = 80;

const svg = d3.select("#stacked-bar-chart");

// initially render chart
renderChart();

function renderChart() {
    // load csv file
    d3.csv("http://vis.lab.djosix.com:2023/data/TIMES_WorldUniversityRankings_2024.csv").then(function (data) {
        const schoolNames = data.map(function (d) { return d["name"] });

        const xScale = d3.scaleLinear()
            .domain([0, 500])
            .range([margin + 300, width - margin]);
        svg.append("g")
            .attr("transform", `translate(0, ${margin})`)
            .call(d3.axisTop(xScale));

        const yScale = d3.scaleBand()
            .domain(schoolNames)
            .range([margin, height - margin])
        svg.append("g")
            .attr("transform", `translate(${margin + 300}, 0)`)
            .call(d3.axisLeft(yScale));

        const stackedData = d3.stack().keys(criteria.slice(1))(data)

        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .join("g")
            .attr("class", function (d) { return `rect_${d.key}`; })
            .attr("fill", function (d) { return colors[d.key]; })
            .selectAll("rect")
            .data(function (d) { return d; })
            .join("rect")
            .attr("x", function (d) { return xScale(d[0]); })
            .attr("y", function (d) { return yScale(d.data["name"]); })
            .attr("height", yScale.bandwidth() - 2)
            .attr("width", function (d) {  
                const w = xScale(d[1]) - xScale(d[0]); 
                if (w)
                    return w;
                return 0; // w is NaN
            })
            .attr("fill", function (d) { return colors[d.data["name"]]; })
            .attr("stroke", "grey")
    });
}