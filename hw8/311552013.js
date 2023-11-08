const attributes = [
    "buying",
    "maint",
    "doors",
    "persons",
    "lug_boot",
    "safety"
];

const width = 1200;
const height = 600;
const margin = 20;

const svg = d3.select("#sankey-diagram-chart");
const color = d3.scaleOrdinal(d3.schemeCategory20);

// initialize sankey library
const sankey = d3.sankey()
    .nodeWidth(20)
    .nodePadding(20)
    .size([width, height]);

// load the data
d3.text("http://vis.lab.djosix.com:2023/data/car.data", function (text) {
    // this csv file doesn't have header, so read it as text, add header, 
    // and read it as csv again    
    const data = d3.csvParse(attributes.join(",") + "\n" + text);

    // calculate the frequency of each value of all attributes
    let freqs = {};
    for (let i = 0; i < attributes.length; i++) {
        if (!freqs[attributes[i]]) {
            freqs[attributes[i]] = {};
        }
        for (let j = 0; j < data.length; j++) {
            if (!freqs[attributes[i]][data[j][attributes[i]]]) {
                freqs[attributes[i]][data[j][attributes[i]]] = 1;
            }
            else {
                freqs[attributes[i]][data[j][attributes[i]]]++;
            }
        }
    }

    // calculate node infos
    let nodes = [];
    let nodeNum = 0;
    for (let i in freqs) {
        for (let j in freqs[i]) {
            nodes.push({ "node": nodeNum, "name": `${i}-${j}` });
            nodeNum++;
        }
    }

    // calculate link infos
    let links = [];
    for (let i = 0; i < attributes.length; i++) {
        for (let j in freqs[attributes[i]]) {
            for (let k in freqs[attributes[i + 1]]) {
                // calculate frequency
                let v = 0;
                for (let m = 0; m < data.length; m++) {
                    if (data[m][attributes[i]] == j && data[m][attributes[i + 1]] == k) {
                        v++;
                    }
                }

                // find source node and target node
                let s = -1, t = -1;
                for (let m = 0; m < nodes.length; m++) {
                    if (nodes[m]["name"] == `${attributes[i]}-${j}`) {
                        s = m;
                    }
                    else if (nodes[m]["name"] == `${attributes[i + 1]}-${k}`) {
                        t = m;
                    }
                }

                links.push({ "source": s, "target": t, "value": v });
            }
        }
    }

    // constructs a new sankey generator with the default settings
    sankey.nodes(nodes)
        .links(links)
        .layout(1);

    // add links
    const link = svg.append("g")
        .selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", sankey.link())
        .style("stroke-width", function (d) { return d.dy; })
        .sort(function (a, b) { return b.dy - a.dy; });

    // add nodes
    const node = svg.append("g")
        .selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function (d) { return `translate(${d.x}, ${d.y})`; })
        .call(d3.drag()
            .subject(function (d) { return d; })
            .on("start", function () { this.parentNode.appendChild(this); })
            .on("drag", function (d) {
                d3.select(this)
                    .attr("transform", `translate(${d.x}, ${d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))})`);
                sankey.relayout();
                link.attr("d", sankey.link());
            }));

    // add rectangles for the nodes
    node.append("rect")
        .attr("height", function (d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) { return color(d.node); })
        .style("stroke", "#000000")
        .append("title")
        .text(function (d) { return `${d.name}: ${d.value}` });

    // add title for the nodes
    node.append("text")
        .attr("x", function (d) { return (d.x < width / 2) ? (sankey.nodeWidth() + 6) : -6 })
        .attr("y", function (d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", function (d) { return (d.x < width / 2) ? "start" : "end" })
        .text(function (d) { return d.name; });
});