function drawNodeLink(processedData) {
    const svg = d3.select("svg");

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

    console.log("South Asia rows:", processedData.filter(d => d.region === "South Asia").slice(0, 10));
    console.log("Bombing rows:", processedData.filter(d => d.attackType === "Bombing/Explosion").slice(0, 10));

    console.log("All unique regions:", Array.from(new Set(processedData.map(d => d.region))).sort());
    console.log("All unique attack types:", Array.from(new Set(processedData.map(d => d.attackType))).sort());

    const links = Object.values(linkCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 30);

    const nodeNames = Array.from(new Set(
        links.flatMap(d => [d.source, d.target])
    ));

    const nodes = nodeNames.map(name => ({ id: name }));
    const regions = Array.from(new Set(processedData.map(d => d.region)));

    const g3 = svg.append("g")
        .attr("transform", "translate(950, 100)");

    g3.append("text")
        .attr("x", 250)
        .attr("y", -50)
        .attr("font-size", "22px")
        .attr("text-anchor", "middle")
        .text("Node-Link Diagram: Terrorism Regions and Types");

    const infoBox = g3.append("g")
        .attr("class", "node-info-box");

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-250))
        .force("center", d3.forceCenter(250, 200));

    const link = g3.selectAll(".node-link-line")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "node-link-line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", d => Math.sqrt(d.count) / 15);

    const node = g3.selectAll(".node-circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", "node-circle")
        .attr("r", 8)
        .attr("fill", d => regions.includes(d.id) ? "#b22222" : "#ff8c00")
        .style("cursor", "pointer");

    const label = g3.selectAll(".node-label")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "node-label")
        .text(d => d.id)
        .attr("font-size", "10px")
        .attr("dx", 10)
        .attr("dy", 4);

    node.on("click", function(clickedNode) {
        const connectedNodeIds = new Set();

        links.forEach(l => {
            const sourceId = typeof l.source === "object" ? l.source.id : l.source;
            const targetId = typeof l.target === "object" ? l.target.id : l.target;

            if (sourceId === clickedNode.id || targetId === clickedNode.id) {
                connectedNodeIds.add(sourceId);
                connectedNodeIds.add(targetId);
            }
        });

        const isRegion = regions.includes(clickedNode.id);

        const matchingRows = processedData.filter(d => {
            return isRegion ? d.region === clickedNode.id : d.attackType === clickedNode.id;
        });

        const connectionCounts = {};
        matchingRows.forEach(d => {
            const key = isRegion ? d.attackType : d.region;
            connectionCounts[key] = (connectionCounts[key] || 0) + 1;
        });

        const topConnection = Object.entries(connectionCounts)
            .sort((a, b) => b[1] - a[1])[0];

        const totalKilled = d3.sum(matchingRows, d => d.killed);
        const totalWounded = d3.sum(matchingRows, d => d.wounded);

        infoBox.selectAll("*").remove();

        infoBox.append("rect")
            .attr("x", -80)
            .attr("y", 10)
            .attr("width", 270)
            .attr("height", 95)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("rx", 8)
            .attr("opacity", 0.95);

        infoBox.append("text")
            .attr("x", 200)
            .attr("y", 10)
            .attr("font-size", "15px")
            .attr("font-weight", "bold")
            .text(clickedNode.id);

        infoBox.append("text")
            .attr("x", -70)
            .attr("y", 30)
            .attr("font-size", "12px")
            .text("Type: " + (isRegion ? "Region" : "Attack Type"));

        infoBox.append("text")
            .attr("x", -70)
            .attr("y", 50)
            .attr("font-size", "12px")
            .text("Total attacks in dataset: " + matchingRows.length.toLocaleString());

        infoBox.append("text")
            .attr("x", -70)
            .attr("y", 70)
            .attr("font-size", "12px")
            .text("Top connection: " + (topConnection ? topConnection[0] + " (" + topConnection[1].toLocaleString() + ")" : "None"));

        infoBox.append("text")
            .attr("x", -70)
            .attr("y", 85)
            .attr("font-size", "12px")
            .text("Killed: " + totalKilled.toLocaleString() + " | Wounded: " + totalWounded.toLocaleString());
    });

    node.on("dblclick", function() {
        node.transition().duration(500).attr("opacity", 1).attr("r", 8);
        label.transition().duration(500).attr("opacity", 1);
        link.transition().duration(500)
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", d => Math.sqrt(d.count) / 15);

        infoBox.selectAll("*").remove();
    });

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

    g3.append("circle").attr("cx", 420).attr("cy", -20).attr("r", 7).attr("fill", "#b22222");
    g3.append("text").attr("x", 440).attr("y", -15).text("Region").attr("font-size", "12px");

    g3.append("circle").attr("cx", 420).attr("cy", 5).attr("r", 7).attr("fill", "#ff8c00");
    g3.append("text").attr("x", 440).attr("y", 10).text("Attack Type").attr("font-size", "12px");

    g3.append("line").attr("x1", 410).attr("y1", 30).attr("x2", 440).attr("y2", 30).attr("stroke", "#999").attr("stroke-width", 4);
    g3.append("text").attr("x", 450).attr("y", 35).text("Thicker line = more Frequency").attr("font-size", "12px");
}

