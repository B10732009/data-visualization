/* 
    1. correlation matrix: each pair of audio features
    2. scatter plots: artists, 發布的歌曲-熱門程度
    3. pie chart: genre
*/

renderChart1();

function renderChart1() {
    d3.csv("http://vis.lab.djosix.com:2023/data/spotify_tracks.csv").then(function (data) {
        const width = 800;
        const height = 1200;
        const margin = 20;

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        let genre = {};
        for (let i = 0; i < data.length; i++) {
            if (genre[data[i]["track_genre"]]) {
                genre[data[i]["track_genre"]]["number"]++;
                genre[data[i]["track_genre"]]["popularity"] += parseInt(data[i]["popularity"]);
            }
            else {
                genre[data[i]["track_genre"]] = {
                    "number": 1,
                    "popularity": parseInt(data[i]["popularity"])
                };
            }
        }

        let genreArr = [];
        for (let g in genre) {
            genreArr.push({
                "name": g,
                "avg_popularity": genre[g]["popularity"] / genre[g]["number"]
            });
        }

        genreArr.sort(function (a, b) { return b["avg_popularity"] - a["avg_popularity"]; });

        // add x-axis
        const xScale = d3.scaleLinear()
            .domain([0, 100])
            .range([margin + 100, width - margin]);
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${margin})`)
            .call(d3.axisTop(xScale));

        // add y-axis
        const yScale = d3.scaleBand()
            .domain(genreArr.map(function (d) { return d["name"] }))
            .range([margin, height - margin])
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin + 100}, 0)`)
            .call(d3.axisLeft(yScale));

        // add bars
        let colors = ["#9F0050", "#BF0060", "#D9006C", "#F00078", "#FF0080"];
        for (let i = 0; i < genreArr.length; i++) {
            svg.append("rect")
                .attr("class", `bar bar-${genreArr[i]["name"]}`)
                .attr("x", margin + 100)
                .attr("y", margin + i * yScale.bandwidth() + 1)
                .attr("width", xScale(genreArr[i]["avg_popularity"]))
                .attr("height", yScale.bandwidth() - 2)
                .attr("fill", colors[Math.floor(genreArr[i]["avg_popularity"] / 20.0)])
                .on("mouseover", function (e, d) {
                    d3.selectAll(".bar")
                        .style("opacity", 0.2);
                    d3.selectAll(`.bar-${genreArr[i]["name"]}`)
                        .style("opacity", 1.0);
                })
                .on("mouseleave", function (e, d) {
                    d3.selectAll(".bar")
                        .style("opacity", 1.0);
                });
        }
    });
}

function renderChart2() {
    d3.csv("http://vis.lab.djosix.com:2023/data/spotify_tracks.csv").then(function (data) {
        const width = 1200;
        const height = 1200;
        const margin = 30;

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        let artists = {};
        for (let i = 0; i < data.length; i++) {
            const a = data[i]["artists"].split(";");
            for (let j = 0; j < a.length; j++) {
                if (artists[a[j]]) {
                    artists[a[j]]["track_number"]++;
                    artists[a[j]]["popularity"] += parseInt(data[i]["popularity"]);
                }
                else {
                    artists[a[j]] = {
                        "track_number": 1,
                        "popularity": parseInt(data[i]["popularity"])
                    };
                }
            }
        }

        // console.log(artists);
        // console.log(Object.keys(artists).length);

        // add x-axis
        const xScale = d3.scaleLinear()
            .domain([0, 550])
            .range([margin, width - margin]);
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height - margin})`)
            .call(d3.axisBottom(xScale));

        // add y-axis
        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height - margin, margin])
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin}, 0)`)
            .call(d3.axisLeft(yScale));

        for (let key in artists) {
            if (artists[key]["track_number"] > 300) {
                // console.log()
                console.log(key, artists[key]["track_number"]);
            }

            svg.append("circle")
                .attr("class", `dot dot-${key}`)
                .attr("cx", xScale(artists[key]["track_number"]))
                .attr("cy", yScale(artists[key]["popularity"] / artists[key]["track_number"]))
                .attr("r", 3)
                .attr("fill", "#B87070")
                .on("mouseover", function (e, d) {
                    d3.selectAll(".dot")
                        .style("opacity", 0.0);
                    d3.selectAll(`.dot-${key}`)
                        .style("opacity", 1.0)
                        .style("r", 5);
                    console.log("a", d3.select(this.parentNode).datum());
                })
                .on("mouseleave", function (e, d) {
                    d3.selectAll(".dot")
                        .style("opacity", 1.0)
                        .attr("fill", "#B87070");
                    console.log("b");
                });
        }

    });
}

function renderChart3() {
    d3.csv("http://vis.lab.djosix.com:2023/data/spotify_tracks.csv").then(function (data) {
        svg.selectAll(".chart").remove();
    
        const width = 1200;
        const height = 800;
        const margin = 30;
        const cellWidth = (width - margin * 2) / features.length;
        const cellHeight = (height - margin * 2) / features.length;

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const features = [
            "", // dummy: cells for rendering feature titles
            "popularity",
            "duration_ms",
            "danceability",
            "energy",
            "key",
            "loudness",
            "mode",
            "speechiness",
            "acousticness",
            "instrumentalness",
            "liveness",
            "valence",
            "tempo",
            "time_signature"
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

        for (let i = 0; i < features.length; i++) {
            for (let j = 0; j < features.length; j++) {
                if (i == 0 && j == 0) {
                    continue;
                }
                else if (i == 0) {
                    svg.append("text")
                        .attr("class", "chart")
                        .attr("x", (i + 0.5) * cellWidth - 1)
                        .attr("y", (j + 0.5) * cellHeight - 1)
                        .attr("text-anchor", "middle")
                        .attr("dy", "0.35em")
                        .attr("font-size", "10px")
                        .text(`${features[j]}`);
                }
                else if (j == 0) {
                    svg.append("text")
                        .attr("class", "chart")
                        .attr("x", (i + 0.5) * cellWidth - 1)
                        .attr("y", (j + 0.5) * cellHeight - 1)
                        .attr("text-anchor", "middle")
                        .attr("dy", "0.35em")
                        .attr("font-size", "10px")
                        .text(`${features[i]}`);
                }
                else {
                    let r = 1.0;
                    if (i != j) {
                        let xsum = 0.0, ysum = 0.0;
                        for (let k = 0; k < data.length; k++) {
                            xsum += parseFloat(data[k][features[i]]);
                            ysum += parseFloat(data[k][features[j]]);
                        }

                        const xavg = xsum / data.length;
                        const yavg = ysum / data.length;

                        let xxsum = 0.0, yysum = 0.0, xysum = 0.0;
                        for (let k = 0; k < data.length; k++) {
                            xxsum += (parseFloat(data[k][features[i]]) - xavg) * (parseFloat(data[k][features[i]]) - xavg);
                            yysum += (parseFloat(data[k][features[j]]) - yavg) * (parseFloat(data[k][features[j]]) - yavg);
                            xysum += (parseFloat(data[k][features[i]]) - xavg) * (parseFloat(data[k][features[j]]) - yavg);
                        }

                        r = Math.round(xysum / Math.sqrt(xxsum * yysum) * 100) / 100;
                    }

                    svg.append("rect")
                        .attr("class", "chart")
                        .attr("x", i * cellWidth)
                        .attr("y", j * cellHeight)
                        .attr("width", cellWidth - 2)
                        .attr("height", cellHeight - 2)
                        .attr("fill", colors[Math.floor((r * 10)) + 10]);

                    svg.append("text")
                        .attr("class", "chart")
                        .attr("x", (i + 0.5) * cellWidth - 1)
                        .attr("y", (j + 0.5) * cellHeight - 1)
                        .attr("text-anchor", "middle")
                        .attr("dy", "0.35em")
                        .attr("font-size", "14px")
                        .text(`${r}`);
                }
            }
        }
    });
}