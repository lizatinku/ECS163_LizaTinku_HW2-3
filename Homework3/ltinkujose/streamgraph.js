function drawStreamGraph(processedData) {
    const svg = d3.select("svg");

    const g4 = svg.append("g")
        .attr("transform", "translate(100, 450)");

    g4.append("text")
        .attr("x", 470)
        .attr("y", 10)
        .attr("font-size", "24px")
        .attr("text-anchor", "middle")
        .text("Stream Graph: Terrorism Attack Types Over Time");

    const selectedTypes = [
        "Bombing/Explosion",
        "Armed Assault",
        "Assassination",
        "Hostage Taking (Kidnapping)"
    ];

    const filteredStreamData = processedData.filter(d =>
        selectedTypes.includes(d.attackType)
    );

    const years = Array.from(new Set(
        filteredStreamData.map(d => d.year)
    )).sort((a, b) => a - b);

    const streamData = years.map(year => {
        const row = { year: year };

        selectedTypes.forEach(type => {
            row[type] = filteredStreamData.filter(d =>
                d.year === year && d.attackType === type
            ).length;
        });

        return row;
    });

    const stack = d3.stack()
        .keys(selectedTypes)
        .offset(d3.stackOffsetWiggle);

    const stackedData = stack(streamData);

    const x3 = d3.scaleLinear()
        .domain(d3.extent(years))
        .range([0, 800]);

    const y3 = d3.scaleLinear()
        .domain([
            d3.min(stackedData, layer => d3.min(layer, d => d[0])),
            d3.max(stackedData, layer => d3.max(layer, d => d[1]))
        ])
        .range([300, 0]);

    const area = d3.area()
        .x(d => x3(d.data.year))
        .y0(d => y3(d[0]))
        .y1(d => y3(d[1]))
        .curve(d3.curveBasis);

    const color = d3.scaleOrdinal()
        .domain(selectedTypes)
        .range(["#b22222", "#4682b4", "#2e8b57", "#ff8c00"]);

    const layers = g4.selectAll(".stream-layer")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "stream-layer")
        .attr("d", area)
        .attr("fill", d => color(d.key))
        .attr("opacity", 0)
        .style("cursor", "pointer");

    // HW3 transition: fade streamgraph in
    layers.transition()
        .duration(1000)
        .attr("opacity", 0.85);

    const legendData = [
        { name: "Bombing/Explosion", key: "Bombing/Explosion", color: "#b22222" },
        { name: "Armed Assault", key: "Armed Assault", color: "#4682b4" },
        { name: "Assassination", key: "Assassination", color: "#2e8b57" },
        { name: "Hostage Taking", key: "Hostage Taking (Kidnapping)", color: "#ff8c00" }
    ];

    const legend = g4.selectAll(".stream-legend")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "stream-legend")
        .attr("transform", (d, i) => `translate(880, ${160 + i * 25})`)
        .style("cursor", "pointer");

    legend.append("circle")
        .attr("r", 7)
        .attr("fill", d => d.color);

    legend.append("text")
        .attr("x", 15)
        .attr("y", 10)
        .text(d => d.name)
        .attr("font-size", "14px");

    // HW3 interaction: click legend to isolate one attack type
    legend.on("click", function(event, selected) {
        layers.transition()
            .duration(600)
            .attr("opacity", d => d.key === selected.key ? 1 : 0.12);

        legend.transition()
            .duration(600)
            .attr("opacity", d => d.key === selected.key ? 1 : 0.35);
    });

    // Double click streamgraph background to reset
    g4.on("dblclick", function() {
        layers.transition()
            .duration(600)
            .attr("opacity", 0.85);

        legend.transition()
            .duration(600)
            .attr("opacity", 1);
    });

    const xAxis3 = d3.axisBottom(x3)
        .tickFormat(d3.format("d"));

    g4.append("g")
        .attr("transform", "translate(0, 300)")
        .call(xAxis3);

    const yAxis3 = d3.axisLeft(y3);

    g4.append("g")
        .call(yAxis3);

    g4.append("text")
        .attr("x", 500)
        .attr("y", 350)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .text("Year");

    g4.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -200)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .text("Attack Frequency");
}