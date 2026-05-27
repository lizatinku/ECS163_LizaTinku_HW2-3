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
d3.csv("globalterrorism_agg.csv").then(rawData =>{
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

// This section prepares yearly attack totals for the line chart overview visualization
    const attacksByYear = Object.keys(yearCounts).map(year => {
        return {
            year: Number(year),
            count: yearCounts[year]
        };
    }).sort((a, b) => a.year - b.year);

    console.log("attacksByYear", attacksByYear);
    
    drawLineChart(processedData);
    drawNodeLink(processedData);
    drawStreamGraph(processedData);
    drawNorthAmericaYearSlider(processedData);
    
    }).catch(function(error){
    console.log(error);
});