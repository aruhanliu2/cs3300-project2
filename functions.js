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
    selection
    .style("fill", function(d) {
        var countyData = data.get(d.id);
        if (countyData) {
            var inputValue = document.getElementById("range1").value;
            var cost = countyData.total_cost;
            var life = countyData.life_expectancy;
            return inputValue >= cost ? colorScale(life) : color_na;
        } else {
            return color_na;
        }
    })
}