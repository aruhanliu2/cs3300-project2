// update the elements
function update(value, data) {
    // adjust the text on the range slider
    d3.select("#income").text("$" + value/1000 + "K");
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
    affordablePercent = "";
    var countArray = [0,0,0,0,0];

    selection
    .style("fill", function(d) {
        var countyData = data.get(d.id);
        if (countyData) {
            var inputValue = slider2.value() * 1000;
            var cost = countyData.total_cost;
            var life = countyData.life_expectancy;
            if (inputValue * 0.45 >= cost) {
                affordableCount++;
                //66,75.64,77.26,78.56,79.82,87
                if (life >= 66 && life < 70) {
                    countArray[0]++;
                } else if (life >= 70 && life < 74) {
                    countArray[1]++;
                } else if (life >= 74 && life < 78) {
                    countArray[2]++;
                } else if (life >= 78 && life < 82) {
                    countArray[3]++;
                } else {
                    countArray[4]++;
                }
                var sum = 20;
                DATA[0] = countArray[0] / sum;
                DATA[1] = countArray[1] / sum;
                DATA[2] = countArray[2] / sum;
                DATA[3] = countArray[3] / sum;
                DATA[4] = countArray[4] / sum;
                affordablePercent = (affordableCount / 3118 * 100).toFixed(1) + "%";
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
    .text("County where you will live longest: " + county_longest + ", " + longest_life_expectancy)
    
    d3.select("#county2")
    .text("County with shortest life expectancy: " + county_shortest + ", " + shortest_life_expectancy)
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
  
function randomData(){
    var labels = color.domain();
    var values = [affordableCount, 3118 - affordableCount];
    var result = [{label: labels[0], value: values[0] / 3118}, {label: labels[1], value: values[1] / 3118}];
    return result;
}

function change(data) {
    /* ------- PIE SLICES -------*/
    d3.select("#percentNumber").text(affordablePercent);
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
        .attr("font-size", "15px")
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

function updateHistogram(data) {
    var colors = ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"];
    var xlabels = [{label: 1},{label: 1},{label: 1},{label: 1},{label: 1}];
    var xScale = d3.scaleBand().range([0, WIDTH]).padding(0.3);
    var xAxis = d3.axisBottom()
        .scale(xScale)
    xScale.domain(xlabels.map(function(d) { return d.label; }));

    var yScale = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([0, HEIGHT]);

    const t = d3.transition()
        .duration(750);
    
    const bar = histogram.selectAll("g")
      .data(data, d => d.id);
    
    var xAxis_g = bar.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height) + ")")
    .call(xAxis)
    .selectAll("text");

    // EXIT section
    bar
      .exit()
        .remove();
    
    // UPDATE section
    bar
      .transition(t)
        .attr("transform", (d, i) => `translate(${i * (BAR_WIDTH + BAR_GAP)},${y(d)})`);

    bar.select("text")
      .transition(t)
        .tween("text", function(d) {
          const v0 = this.textContent || "0";
          const v1 = d.value;
          const i = d3.interpolateRound(v0, v1);
          return t => this.textContent = i(t);
        });
    
    // ENTER section
    const barEnter = bar
      .enter().append("g")
        .attr("transform", (d, i) => `translate(${i * (BAR_WIDTH + BAR_GAP)},${INNER_HEIGHT})`);
  
    barEnter
      .transition(t)
        .attr("transform", (d, i) => `translate(${i * (BAR_WIDTH + BAR_GAP)},${y(d)})`);

    var i = -1;
    const rect = barEnter.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", function(d) {
            i++;
            return colors[i];
        })
        .attr("width", BAR_WIDTH)
        .attr("height", 0);
    
    rect
      .transition(t)
        .attr("height", height);
    
    var text = barEnter.append("text")
        .text(function(d) {
            return result = d.value;
        })
        .attr("text-anchor", "middle")
        .attr("dx", BAR_WIDTH / 2)
        .attr("dy", -2);  
}

function preprocess(data) {
    //data = d3.shuffle([...data]);
    return data.map((d, i) => ({ id: i, value: d }));
  }