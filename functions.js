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
    affordableCount = 0;

    selection
    .style("fill", function(d) {
        var countyData = data.get(d.id);
        if (countyData) {
            var inputValue = slider2.value() * 1000;
            var cost = countyData.total_cost;
            var life = countyData.life_expectancy;
            if (inputValue * 0.45 >= cost) {
                affordableCount++;
                affordablePercent = Math.round(affordableCount / 3118 * 100) + "%";
                unaffordablePercent = Math.round((3118 - affordableCount) / 3118 * 100) + "%";
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
    .text("shortest life expectancy: " + county_shortest + ", " + shortest_life_expectancy + affordableCount)


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
    var income_needed= ((d.total_cost*100)/45);
    income_needed= parseFloat(income_needed).toFixed(2);
    div .html(d.county + "<br>" + "income needed: " + income_needed + "<br>" + "life expectancy: " + d.life_expectancy)  
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

function randomData(affordableCount){
    var labels = color.domain();
    var values = [affordableCount, 3118 - affordableCount];
    var i = 0;
    return [{label: labels[0], value: values[0] / 3118}, {label: labels[1], value: values[1] / 3118}];
}

function change(data) {

    /* ------- PIE SLICES -------*/
	var slice = piechart.select(".slices").selectAll("path.slice")
		.data(pie(data), key);

	slice.enter()
		.insert("path")
		.style("fill", function(d) { return color(d.data.label); })
		.attr("class", "slice");

	slice		
		.transition().duration(1000)
		.attrTween("d", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				return arc(interpolate(t));
			};
		})

	slice.exit()
		.remove();

	/* ------- TEXT LABELS -------*/

	var text = piechart.select(".labels").selectAll("text")
		.data(pie(data), key);

	text.enter()
		.append("text")
		.attr("dy", ".35em")
		.text(function(d) {
			return d.data.label;
		});
	
	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text.transition().duration(1000)
		.attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});

	text.exit()
		.remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = piechart.select(".lines").selectAll("polyline")
		.data(pie(data), key);
	
	polyline.enter()
		.append("polyline");

	polyline.transition().duration(1000)
		.attrTween("points", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [arc.centroid(d2), outerArc.centroid(d2), pos];
			};			
		});
	
	polyline.exit()
		.remove();
};