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

const sortingRules = {
    "overall_scores_ascending": function(a, b) { 
        return parseFloat(a["scores_teaching"]) - parseFloat(b["scores_teaching"]) +
        parseFloat(a["scores_research"]) - parseFloat(b["scores_research"]) +
        parseFloat(a["scores_citations"]) - parseFloat(b["scores_citations"]) +
        parseFloat(a["scores_industry_income"]) - parseFloat(b["scores_industry_income"]) +
        parseFloat(a["scores_international_outlook"]) - parseFloat(b["scores_international_outlook"]);
    },
    "overall_scores_descending": function(b, a) { 
        return parseFloat(a["scores_teaching"]) - parseFloat(b["scores_teaching"]) +
        parseFloat(a["scores_research"]) - parseFloat(b["scores_research"]) +
        parseFloat(a["scores_citations"]) - parseFloat(b["scores_citations"]) +
        parseFloat(a["scores_industry_income"]) - parseFloat(b["scores_industry_income"]) +
        parseFloat(a["scores_international_outlook"]) - parseFloat(b["scores_international_outlook"]);
    },
    "teaching_scores_ascending": function(a, b) { 
        return parseFloat(a["scores_teaching"]) - parseFloat(b["scores_teaching"]);
    },
    "teaching_scores_descending": function(b, a) { 
        return parseFloat(a["scores_teaching"]) - parseFloat(b["scores_teaching"]);
    },
    "research_scores_ascending": function(a, b) { 
        return parseFloat(a["scores_research"]) - parseFloat(b["scores_research"]);
    },
    "research_scores_descending": function(b, a) { 
        return parseFloat(a["scores_research"]) - parseFloat(b["scores_research"]);
    },
    "citation_scores_ascending": function(a, b) { 
        return parseFloat(a["scores_citations"]) - parseFloat(b["scores_citations"]);
    },
    "citation_scores_descending": function(b, a) { 
        return parseFloat(a["scores_citations"]) - parseFloat(b["scores_citations"]);
    },
    "industry_income_scores_ascending": function(a, b) { 
        return parseFloat(a["scores_industry_income"]) - parseFloat(b["scores_industry_income"]);
    },
    "industry_income_scores_descending": function(b, a) { 
        return parseFloat(a["scores_industry_income"]) - parseFloat(b["scores_industry_income"]);
    },
    "international_outlook_scores_ascending": function(a, b) { 
        return parseFloat(a["scores_international_outlook"]) - parseFloat(b["scores_international_outlook"]);
    },
    "international_outlook_scores_descending": function(b, a) { 
        return parseFloat(a["scores_international_outlook"]) - parseFloat(b["scores_international_outlook"]);
    },
}

let sortingRule = ""; // sorting rule being selected

const width = 1000;
const height = 50000;
const margin = 80;

const svg = d3.select("#stacked-bar-chart");

// initially render chart
renderChart();

function selectSortingRule() {
    sortingRule = d3.select("#selected-sorting-rule").property("value");
}

function renderChart() {
    // load csv file
    d3.csv("http://vis.lab.djosix.com:2023/data/TIMES_WorldUniversityRankings_2024.csv").then(function (data) {
        // remove old axes and bars
        svg.selectAll(".rect").remove();
        svg.selectAll(".axis").remove();
    
        // sort data by the selected sorting rule
        if (sortingRule) {
            data.sort(sortingRules[sortingRule]);
        }

        // get all school names
        const schoolNames = data.map(function (d) { return d["name"] });

        // add x-axis
        const xScale = d3.scaleLinear()
            .domain([0, 500])
            .range([margin + 300, width - margin]);
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${margin})`)
            .call(d3.axisTop(xScale));

        // add y-axis
        const yScale = d3.scaleBand()
            .domain(schoolNames)
            .range([margin, height - margin])
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin + 300}, 0)`)
            .call(d3.axisLeft(yScale));

        //add bars
        const stackedData = d3.stack().keys(criteria.slice(1))(data)

        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .join("g")
            .attr("class", function (d) { return `rect ${d.key}`; })
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
            .on("mouseover", function (e, d) {
                const criterion = d3.select(this.parentNode).datum().key;
                d3.selectAll(".rect").style("opacity", 0.2);
                d3.selectAll(`.${criterion}`).style("opacity", 1);
            })
            .on("mouseleave", function (e, d) { 
                d3.selectAll(".rect").style("opacity", 1)
            })
    });
}