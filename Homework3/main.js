let abFilter = 25;

// Plots
d3.csv("globalterrorismdb_0718dist.csv").then(rawData => {
    console.log("rawData", rawData);

    rawData.forEach(d => {
        d.iyear = Number(d.iyear);
        d.nkill = Number(d.nkill) || 0;
        d.nwound = Number(d.nwound) || 0;
    });

    const processedData = rawData.map(d => {
        return {
            year: d.iyear,
            region: d.region_txt,
            attackType: d.attacktype1_txt,
            killed: d.nkill,
            wounded: d.nwound
        };
    });

    console.log("processedData", processedData);

    drawLineChart(processedData);
    drawNodeLink(processedData);
    drawStreamGraph(processedData);

}).catch(error => {
    console.log(error);
});