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

    const links = Object.values(linkCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 30);

    const nodeNames = Array.from(new Set(
        links.flatMap(d => [d.source, d.target])
    ));

    const nodes = nodeNames.map(name => {
        return { id: name };
    });

    const regions = Array.from(new Set(processedData.map(d => d.region)));

    const g3 = svg.append("g")
        .attr("transform", "translate(950, 100)");

    g3.append("text")
        .attr("x", 250)
        .attr("y", -40)
        .attr("font-size", "22px")
        .attr("text-anchor", "middle")
        .text("Node-Link Diagram: Terrorism Regions and Types");

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links)
            .id(d => d.id)
            .distance(120))
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

    // HW3 interaction: click a node to highlight connected nodes/links
    node.on("click", function(event, clickedNode) {
        const connectedNodeIds = new Set();

        links.forEach(l => {
            const sourceId = typeof l.source === "object" ? l.source.id : l.source;
            const targetId = typeof l.target === "object" ? l.target.id : l.target;

            if (sourceId === clickedNode.id || targetId === clickedNode.id) {
                connectedNodeIds.add(sourceId);
                connectedNodeIds.add(targetId);
            }
        });

        node.transition()
            .duration(500)
            .attr("opacity", d => connectedNodeIds.has(d.id) ? 1 : 0.15)
            .attr("r", d => d.id === clickedNode.id ? 13 : 8);

        label.transition()
            .duration(500)
            .attr("opacity", d => connectedNodeIds.has(d.id) ? 1 : 0.15);

        link.transition()
            .duration(500)
            .attr("stroke-opacity", l => {
                const sourceId = typeof l.source === "object" ? l.source.id : l.source;
                const targetId = typeof l.target === "object" ? l.target.id : l.target;
                return sourceId === clickedNode.id || targetId === clickedNode.id ? 1 : 0.08;
            })
            .attr("stroke-width", l => {
                const sourceId = typeof l.source === "object" ? l.source.id : l.source;
                const targetId = typeof l.target === "object" ? l.target.id : l.target;
                return sourceId === clickedNode.id || targetId === clickedNode.id
                    ? Math.sqrt(l.count) / 8
                    : Math.sqrt(l.count) / 15;
            });
    });

    // double click resets the node-link view
    node.on("dblclick", function() {
        node.transition()
            .duration(500)
            .attr("opacity", 1)
            .attr("r", 8);

        label.transition()
            .duration(500)
            .attr("opacity", 1);

        link.transition()
            .duration(500)
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", d => Math.sqrt(d.count) / 15);
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

    g3.append("circle")
        .attr("cx", -40)
        .attr("cy", -20)
        .attr("r", 7)
        .attr("fill", "#b22222");

    g3.append("text")
        .attr("x", -20)
        .attr("y", -15)
        .text("Region")
        .attr("font-size", "12px");

    g3.append("circle")
        .attr("cx", -40)
        .attr("cy", 5)
        .attr("r", 7)
        .attr("fill", "#ff8c00");

    g3.append("text")
        .attr("x", -20)
        .attr("y", 10)
        .text("Attack Type")
        .attr("font-size", "12px");

    g3.append("line")
        .attr("x1", -45)
        .attr("y1", 30)
        .attr("x2", -15)
        .attr("y2", 30)
        .attr("stroke", "#999")
        .attr("stroke-width", 4);

    g3.append("text")
        .attr("x", -5)
        .attr("y", 35)
        .text("Thicker line = more Frequency")
        .attr("font-size", "12px");
}