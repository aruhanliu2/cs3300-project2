// update the elements
function update(value, data) {
    // adjust the text on the range slider
    d3.select("#income").text("$" + value/1000 + "K");
    d3.select("#slider2").property("value", value);

    d3.selectAll("path.county").transition()
    .delay(100)
    .call(fillMap, data);
}

//color fill
function fillMap(selection, data) {
    county_longest = "";
    county_shortest = "";
    longest_life_expectancy = 0;
    shortest_life_expectancy = 100;

    selection
    .style("fill", function(d) {
        var countyData = data.get(d.id);
        if (countyData) {
            var inputValue = slider2.value() * 1000;
            var cost = countyData.total_cost;
            var life = countyData.life_expectancy;
            if (inputValue * 0.45 >= cost) {
                if (longest_life_expectancy < countyData.life_expectancy) {
                    longest_life_expectancy = countyData.life_expectancy;
                    county_longest = countyData.county;
                }
                if (shortest_life_expectancy > countyData.life_expectancy) {
                    shortest_life_expectancy = countyData.life_expectancy;
                    county_shortest = countyData.county;
                }
                return colorScale(life);
            } else {
                return color_na;
            }
        } else {
            return color_na;
        }
    })

    d3.select("#county1")
    .text("longest life expectancy: " + county_longest + ", " + longest_life_expectancy)
    
    d3.select("#county2")
    .text("shortest life expectancy: " + county_shortest + ", " + shortest_life_expectancy)
}

//event handlers
function legendMouseOver(color_key, data) {

}

function legendMouseOut() {
    d3.selectAll("path").transition()
        .delay(100)
        .call(fillMap, data);
}

function countyMouseOver(currentState, d) {
    d3.select(currentState).style('fill-opacity', 1);
    div.transition()        
        .duration(200)      
        .style("opacity", .9);      
    div .html(d.county + "<br>" + "total cost: " + d.total_cost + "<br>" + "life_expectancy: " + d.life_expectancy)  
        .style("left", (d3.event.pageX) + "px")     
        .style("top", (d3.event.pageY - 28) + "px");  
}

function countyMouseOut(d) {
    d3.selectAll("path")
    .style({
        'fill-opacity':.7
    });
    div.transition()        
    .duration(500)      
    .style("opacity", 0);
}

function scatterPlot(data) {
    var padding = 45;
    var padding2 = 20;

    var xmax = d3.max(data, function(d) { return +d.total_cost;} );
    var xmin = d3.min(data, function(d) { return +d.total_cost;} );
    var ymax = d3.max(data, function(d) { return +d.life_expectancy;} );
    var ymin = d3.min(data, function(d) { return +d.life_expectancy;} );
    // Now create a plot
    var svg = d3.select("#svg1")
    // .attr("height", 300 + 2 * padding).attr("width", 400 + 2 * padding)
     .append("g").attr("transform", "translate(" + padding + "," + padding + ")");

    var xScale = d3.scaleLinear().domain([xmin, xmax]).range([0,400]);
    var yScale = d3.scaleLinear().domain([ymin, ymax]).range([300,0]);


    //add points
    svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', function(d) {
        return xScale(d.total_cost);
    })
    .attr('cy', function(d) {
        return yScale(d.life_expectancy);
    })
    .attr('r', 1)
    .attr('fill', "red");

    // Add axes
    svg.append("g").call(d3.axisLeft(yScale).ticks(3));
    svg.append("g").call(d3.axisBottom(xScale).ticks(6))
    .attr("transform", "translate(0," + (300) + ")");

    // Add axis labels
    svg.append("text").attr("transform", "translate(0, -20)").text("scatter plot");
    svg.append("text").attr("transform", "rotate(270) translate(-170, -32)").text("life expectancy");
    svg.append("text").attr("transform", "translate(200, 330)").text("total cost");
}