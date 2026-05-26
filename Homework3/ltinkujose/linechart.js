function drawLineChart(processedData) {

    const yearCounts = {};

    processedData.forEach(d => {
        if (!yearCounts[d.year]) yearCounts[d.year] = 0;
        yearCounts[d.year]++;
    });

    const attacksByYear = Object.keys(yearCounts).map(year => ({
        year: Number(year),
        count: yearCounts[year]
    })).sort((a, b) => a.year - b.year);

    const svg = d3.select("svg");

    const scatterMargin = {top: 10, right: 30, bottom: 30, left: 60};
    const scatterWidth = 400 - scatterMargin.left - scatterMargin.right;
    const scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

    const g1 = svg.append("g")
        .attr("transform", `translate(100, 60)`);

    g1.append("text")
        .attr("x", 260)
        .attr("y", -2)
        .attr("font-size", "24px")
        .attr("text-anchor", "middle")
        .text("Line chart: Global Terrorism Attacks over the years");

    g1.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + 60)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .text("Year");

    g1.append("text")
        .attr("x", -(scatterHeight / 2))
        .attr("y", -50)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Number of Attacks");

    const x1 = d3.scaleLinear()
        .domain([1970, 2017])
        .range([0, scatterWidth]);

    const y1 = d3.scaleLinear()
        .domain([0, d3.max(attacksByYear, d => d.count)])
        .range([scatterHeight, 0]);

    const xAxis = g1.append("g")
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(d3.axisBottom(x1).tickFormat(d3.format("d")));

    const yAxis = g1.append("g")
        .call(d3.axisLeft(y1));

    const line = d3.line()
        .x(d => x1(d.year))
        .y(d => y1(d.count));

    g1.append("path")
        .datum(attacksByYear)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line);

    g1.append("line")
        .attr("x1", 360)
        .attr("y1", 20)
        .attr("x2", 390)
        .attr("y2", 20)
        .attr("stroke", "red")
        .attr("stroke-width", 3);

    g1.append("text")
        .attr("x", 400)
        .attr("y", 25)
        .text("Total Attacks")
        .attr("font-size", "12px");
    
    // Magnifying glass code
    const focus = g1.append("g")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 23)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("opacity", 0.9);

    focus.append("circle")
        .attr("r", 5)
        .attr("fill", "green");

    focus.append("line")
        .attr("x1", 18)
        .attr("y1", 18)
        .attr("x2", 42)
        .attr("y2", 42)
        .attr("stroke", "black")
        .attr("stroke-width", 4)
        .attr("stroke-linecap", "round");

    const tooltip = g1.append("text")
        .attr("font-size", "13px")
        .attr("font-weight", "bold")
        .style("display", "none");

    const bisectYear = d3.bisector(d => d.year).left;

    g1.append("rect")
        .attr("width", scatterWidth)
        .attr("height", scatterHeight)
        .attr("fill", "transparent")
        .style("cursor", "zoom-in")
        .on("mouseover", function() {
            focus.style("display", null);
            tooltip.style("display", null);
        })
        .on("mouseout", function() {
            focus.style("display", "none");
            tooltip.style("display", "none");
        })
        .on("mousemove", function() {
            const mouse = d3.mouse(this);
            const hoveredYear = Math.round(x1.invert(mouse[0]));

            let i = bisectYear(attacksByYear, hoveredYear);
            if (i >= attacksByYear.length) i = attacksByYear.length - 1;

            const d0 = attacksByYear[i - 1];
            const d1 = attacksByYear[i];
            let d = d1;

            if (d0 && d1) {
                d = hoveredYear - d0.year > d1.year - hoveredYear ? d1 : d0;
            }

            const focusX = x1(d.year);
            const focusY = y1(d.count);

            focus
                .transition()
                .duration(80)
                .attr("transform", `translate(${focusX}, ${focusY})`);

            tooltip
                .attr("x", focusX + 45)
                .attr("y", focusY - 35)
                .text(`${d.year}: ${d.count.toLocaleString()} attacks`);
        });
}