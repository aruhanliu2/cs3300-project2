// update the elements
function update(value, data) {
    // adjust the text on the range slider
    d3.select("#income").text(value);
    d3.select("#range1").property("value", value);

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
            var inputValue = document.getElementById("range1").value;
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
    .attr("transform", "translate(250,40)")
    .text("longest life expectancy: " + county_longest + ", " + longest_life_expectancy)
    
    d3.select("#county2")
    .attr("transform", "translate(250,80)")
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