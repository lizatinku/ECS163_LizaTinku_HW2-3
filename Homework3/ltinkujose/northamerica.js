function drawNorthAmericaYearSlider(processedData) {
    const svg = d3.select("svg");

    const chartWidth = 520;
    const chartHeight = 260;
    const margin = { top: 50, right: 30, bottom: 95, left: 65 };

    const g = svg.append("g")
        .attr("transform", "translate(1150, 600)");

    g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -20)
        .attr("font-size", "22px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("North America Attack Types by Year");

    const plot = g.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const northAmericaData = processedData.filter(d =>
        d.region === "North America" &&
        d.year >= 1970 &&
        d.year <= 2015
    );

    const selectedTypes = [
        "Bombing/Explosion",
        "Armed Assault",
        "Assassination",
        "Facility/Infrastructure Attack",
        "Hostage Taking (Kidnapping)"
    ];

    const years = d3.range(1970, 2016);

    function getYearData(year) {
        return selectedTypes.map(type => {
            return {
                type: type,
                count: northAmericaData.filter(d =>
                    d.year === year && d.attackType === type
                ).length
            };
        });
    }

    const maxCount = d3.max(years, year =>
        d3.max(getYearData(year), d => d.count)
    );

    const x = d3.scaleBand()
        .domain(selectedTypes)
        .range([0, innerWidth])
        .padding(0.25);

    const y = d3.scaleLinear()
        .domain([0, maxCount])
        .range([innerHeight, 0]);

    const color = d3.scaleOrdinal()
        .domain(selectedTypes)
        .range(["#b22222", "#4682b4", "#2e8b57", "#999999", "#ff8c00"]);

    const xAxis = plot.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(x));

    xAxis.selectAll("text")
        .attr("transform", "rotate(-35)")
        .attr("text-anchor", "end")
        .attr("font-size", "9px");

    plot.append("g")
        .call(d3.axisLeft(y).ticks(5));

    g.append("text")
        .attr("x", margin.left + innerWidth / 2)
        .attr("y", chartHeight - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .text("Attack Type");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(margin.top + innerHeight / 2))
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .text("Number of Attacks");

    const yearLabel = g.append("text")
        .attr("x", margin.left + innerWidth / 2)
        .attr("y", 15)
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Year: 1970");

    const bars = plot.selectAll(".na-bar")
        .data(getYearData(1970))
        .enter()
        .append("rect")
        .attr("class", "na-bar")
        .attr("x", d => x(d.type))
        .attr("width", x.bandwidth())
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("fill", d => color(d.type));

    let selectedType = null;

    bars.style("cursor", "pointer")
        .on("click", function(clickedData) {
            if (selectedType === clickedData.type) {
                selectedType = null;
            } else {
                selectedType = clickedData.type;
            }

            bars.transition()
                .duration(300)
                .attr("opacity", d => selectedType === null || d.type === selectedType ? 1 : 0);

            valueLabels.transition()
                .duration(300)
                .attr("opacity", d => selectedType === null || d.type === selectedType ? 1 : 0);
        });

    bars.transition()
        .duration(800)
        .attr("y", d => y(d.count))
        .attr("height", d => innerHeight - y(d.count));

    const valueLabels = plot.selectAll(".na-value-label")
        .data(getYearData(1970))
        .enter()
        .append("text")
        .attr("class", "na-value-label")
        .attr("x", d => x(d.type) + x.bandwidth() / 2)
        .attr("y", d => y(d.count) - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(d => d.count);

    const sliderGroup = g.append("g")
        .attr("transform", `translate(${margin.left}, ${chartHeight + 25})`);

    sliderGroup.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", "12px")
        .text("Slide through years:");

    sliderGroup.append("foreignObject")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", innerWidth)
        .attr("height", 45)
        .append("xhtml:input")
        .attr("type", "range")
        .attr("min", 1970)
        .attr("max", 2015)
        .attr("step", 1)
        .attr("value", 1970)
        .style("width", innerWidth + "px")
        .on("input", function() {
            const selectedYear = +this.value;
            updateYear(selectedYear);
        });

    function updateYear(selectedYear) {
        const updatedData = getYearData(selectedYear);
        yearLabel.text("Year: " + selectedYear);

        bars.data(updatedData)
            .transition()
            .duration(500)
            .attr("y", d => y(d.count))
            .attr("height", d => innerHeight - y(d.count))
            .attr("fill", d => color(d.type))
            .attr("opacity", d => {
                if (selectedType === null);
                return d.type === selectedType ? 1 : 0;
        });
        
        valueLabels.data(updatedData)
            .transition()
            .duration(500)
            .attr("y", d => y(d.count) - 5)
            .text(d => d.count);
    }
}