let abFilter = 25;
const width = window.innerWidth;
const height = window.innerHeight;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let teamLeft = 0, teamTop = 400;
let teamMargin = {top: 10, right: 30, bottom: 30, left: 60},
    teamWidth = width - teamMargin.left - teamMargin.right,
    teamHeight = height-450 - teamMargin.top - teamMargin.bottom;

// Plots
d3.csv("data/globalterrorismdb_0718dist.csv").then(rawData =>{
    console.log("rawData", rawData);
    rawData.forEach(function(d){
    d.iyear = Number(d.iyear);
    d.nkill = Number(d.nkill) || 0;
    d.nwound = Number(d.nwound) || 0;
    });

    const filteredData = rawData;
    const processedData = filteredData.map(d => {
    return {
        year: d.iyear,
        region: d.region_txt,
        attackType: d.attacktype1_txt,
        killed: d.nkill,
        wounded: d.nwound
    };
    });
    console.log("processedData", processedData);

    const yearCounts = {};

    processedData.forEach(d => {
        if (!yearCounts[d.year]) {
            yearCounts[d.year] = 0;
        }
        yearCounts[d.year]++;
    });

    const attacksByYear = Object.keys(yearCounts).map(year => {
        return {
            year: Number(year),
            count: yearCounts[year]
        };
    }).sort((a, b) => a.year - b.year);

    console.log("attacksByYear", attacksByYear);

    //plot 1: Line Chart: Attacks Per Year
    const svg = d3.select("svg");

    const g1 = svg.append("g")
                .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
                .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
                .attr("transform", `translate(100, 60)`);
                // .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);

    g1.append("text")
        .attr("x", 220)
        .attr("y", 5)
        .attr("font-size", "24px")
        .attr("text-anchor", "middle")
        .text("Global Terrorism Attacks over the years");
    
    // X label
    g1.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight + 60)
    .attr("font-size", "16px")
    .attr("text-anchor", "middle")
    .text("Year");

    // Y label
    g1.append("text")
    .attr("x", -(scatterHeight / 2))
    .attr("y", -50)
    .attr("font-size", "16px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Number of Attacks");

    // X ticks
    const x1 = d3.scaleLinear()
    .domain(d3.extent(attacksByYear, d => d.year))
    .range([0, scatterWidth]);

    const xAxisCall = d3.axisBottom(x1)
                        .ticks(7);
    g1.append("g")
    .attr("transform", `translate(0, ${scatterHeight})`)
    .call(xAxisCall)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");

    const y1 = d3.scaleLinear()
    .domain([0, d3.max(attacksByYear, d => d.count)])
    .range([scatterHeight, 0]);

    const yAxisCall = d3.axisLeft(y1)
                        .ticks(13);
    g1.append("g").call(yAxisCall);

    const line = d3.line()
    .x(d => x1(d.year))
    .y(d => y1(d.count));

    g1.append("path")
        .datum(attacksByYear)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line);

    // circles

    const g2 = svg.append("g")
                .attr("width", distrWidth + distrMargin.left + distrMargin.right)
                .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
                .attr("transform", `translate(${distrLeft}, ${distrTop})`);

    
    //Plot 2: Node-Link Diagram - Regions and Attack Types
    const linkCounts = {};

    processedData.forEach(d => {
        const key = d.region + "||" + d.attackType;

        if (!linkCounts[key]) {
            linkCounts[key] = {
                source: d.region,
                target: d.attackType,
                count: 0
            };
        }

        linkCounts[key].count++;
    });

    const links = Object.values(linkCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 30);

    console.log("node-link links", links);

    const nodeNames = Array.from(new Set(
    links.flatMap(d => [d.source, d.target])
    ));

    const nodes = nodeNames.map(name => {
        return { id: name };
    });

    console.log("node-link nodes", nodes);

    const g3 = svg.append("g")
    .attr("transform", "translate(480, 100)");
    
    g3.append("text")
    .attr("x", 250)
    .attr("y", -40)
    .attr("font-size", "22px")
    .attr("text-anchor", "middle")
    .text("Node-Link Diagram: Global Terrorism");
    
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links)
            .id(d => d.id)
            .distance(120))
        .force("charge", d3.forceManyBody().strength(-250))
        .force("center", d3.forceCenter(250, 200));

    const link = g3.selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", d => Math.sqrt(d.count) / 15);
    
    const node = g3.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", 8)
        .attr("fill", d => {
            const regions = processedData.map(p => p.region);
            if (regions.includes(d.id)) {
                return "#b22222";
            } else {
                return "#ff8c00";
            }
        });

    const label = g3.selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .text(d => d.id)
        .attr("font-size", "10px")
        .attr("dx", 10)
        .attr("dy", 4);
    
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    // Legend
    g3.append("circle")
        .attr("cx", 470)
        .attr("cy", -20)
        .attr("r", 7)
        .attr("fill", "#b22222");

    g3.append("text")
        .attr("x", 490)
        .attr("y", -15)
        .text("Region")
        .attr("font-size", "12px");

    g3.append("circle")
        .attr("cx", 470)
        .attr("cy", 5)
        .attr("r", 7)
        .attr("fill", "#ff8c00");

    g3.append("text")
        .attr("x", 500)
        .attr("y", 10)
        .text("Attack Type")
        .attr("font-size", "12px");

    g3.append("line")
        .attr("x1", 465)
        .attr("y1", 30)
        .attr("x2", 480)
        .attr("y2", 30)
        .attr("stroke", "#999")
        .attr("stroke-width", 4);

    g3.append("text")
        .attr("x", 500)
        .attr("y", 35)
        .text("Thicker line = more Frequency")
        .attr("font-size", "12px");
    console.log("node-link nodes", nodes);

    }).catch(function(error){
    console.log(error);
});