function Graph(){

/* 
Description: This function updates the HTML page with the relevant graph. The different functions and methods used are listed below:

Step 1: We first set the Margins, SVG containers
Step 2: Define data and link to respective axis/purpose 
Step 3: Set various scales and graph dimensions
Step 4: Define x,y axis and their features
Step 4: Load Data: List of all functions defined inside Load Data Function include:
		1) Bisect - This function places the value to be inserted in the either left or right position (Reference : https://stackoverflow.com/questions/28117403/adding-traces-to-d3-js-animated-bubble-chart)
		2) InterpolateValues InterpolateData - Insert the data for a particular year and retrieve the value (Reference : https://stackoverflow.com/questions/28117403/adding-traces-to-d3-js-animated-bubble-chart)
		3) tweenYear - This function will call the interpolate Value (Reference : https://stackoverflow.com/questions/28117403/adding-traces-to-d3-js-animated-bubble-chart)
		3) position - Assign the circles based on x,y axis values
		4) showTooltip - Assigns value for tooltips for a given circle (Reference: http://bl.ocks.org/d3noob/a22c42db65eb00d4e369)
		5) startInteraction - Sets Interaction
*/

//  1) Cosmetic Changes =========================================================================================
	// Set Margins 
	var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5};
    var props = {
	    width: 960 - margin.right,
	    height: 500 - margin.top - margin.bottom,
	    marginTop: margin.top,
	    marginBottom: margin.bottom,
	    marginRight: margin.right,
	    marginLeft: margin.left 
	}
    var marginLeft = props.marginLeft;
    var marginRight = props.marginRight;
    var marginTop = props.marginTop;
    var marginBottom = props.marginBottom;
    
    var svg = d3.select("#chart1")
		.append("svg")
		.attr("width", props.width + marginLeft + marginRight)
		.attr("height", props.height + marginTop + marginBottom + 130);

	
	// Connect data to different purpose
    function x(d) { return d.income; }
    function y(d) { return d.lifeExpectancy; }
    function radius(d) { return d.population; }
    function color(d) { return d.region; }
    function key(d) { return d.name; }

    var height = props.height;
    var width = props.width;
    var margin = {top: props.marginTop,
		  right: props.marginRight,
		  bottom: props.marginBottom,
		  left: props.marginLeft};

	 // Scales
    var xScale = d3.scale.log().domain([300, 1e5]).range([0, width]),
	yScale = d3.scale.linear().domain([10, 85]).range([height, 0]),
	radiusScale = d3.scale.sqrt().domain([0, 5e8]).range([0, 40]),
	colorScale = d3.scale.category20(); // (Reference : http://bl.ocks.org/aaizemberg/78bd3dade9593896a59d)

	// Define x,y axis
    var xAxis = d3.svg.axis().orient("bottom")
	    .scale(xScale).ticks(12, d3.format(",d"));
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    var svg = d3.select("svg")
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add the x-axis.
    svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);

    // Add the y-axis.
    svg.append("g")
	.attr("class", "y axis")
	.call(yAxis);

    // Add an x-axis label.
    svg.append("text")
	.attr("class", "x label")
	.attr("text-anchor", "end")
	.attr("x", width)
	.attr("y", height - 6)
	.text("GDP of the country");

    // Add a y-axis label.
    svg.append("text")
	.attr("class", "y label")
	.attr("text-anchor", "end")
	.attr("y", 6)
	.attr("dy", ".75em")
	.attr("transform", "rotate(-90)")
	.text("CO2 emission");

	var label = svg.append("text")
	.attr("class", "year label")
	.attr("text-anchor", "end")
	.attr("y", height + 130)
	.attr("x", width)
	.text(1990);


//  2) Data Loading/Processing =========================================================================================
	
	//Load data
	d3.json("data/nations_new.json", function(nations){
		console.log(nations)
		var bisect = d3.bisector(function(d) {
	    console.log(d);
	    return d[0];
	});

		function interpolateValues(values, year) {
	    	var i = bisect.left(values, year, 0, values.length - 1),
			a = values[i];
	    	if (i > 0) {
			var b = values[i - 1],
		    	t = (year - a[0]) / (b[0] - a[0]);
		    	//console.log("b = " + b);
			return a[1] * (1 - t) + b[1] * t;
	    	}
	    	return a[1];
	}

		function interpolateData(year) {
	    	return nations.map(function(d) {

		    //console.log("d.income");
		    //console.log(d.income);

			return {
		    	name: d.name,
		    	region: d.region,
		    	income: interpolateValues(d.income, year),
		    	population: interpolateValues(d.population, year),
		    	lifeExpectancy: interpolateValues(d.lifeExpectancy, year)
			};
	    	});
		}

		// Positions the dots based on circle.
		function position(dot) {
	    	dot.attr("cx", function(d) { return xScale(x(d)); })
			.attr("cy", function(d) { return yScale(y(d)); })
			.attr("r", function(d) { return radiusScale(radius(d)); });
		}

		function order(a, b) {
	    	return radius(b) - radius(a);
		}

		// Initialize the data at 1900, and set the colors.
	var dot = svg.append("g")
	    .attr("class", "dots")
	    .selectAll(".dot")
	    .data(interpolateData(1990))
	    .enter().append("circle")
	    .attr("class", "dot")
	    .attr("id", function(d) { return (d.name)
				      .replace(/\s/g, '').replace(/\./g,'').replace(/\,/g,'')
				      .replace(/\'/g,''); })
	    .style("fill", function(d) { return colorScale(color(d)); })
	    .call(position)
	    .sort(order);

	dot.append("title")
	    .text(function(d) { return d.name; });
	// Add an overlay for the year label.
	var box = label.node().getBBox();

	var overlay = svg.append("rect")
		.attr("class", "overlay")
		.attr("x", box.x)
		.attr("y", box.y)
		.attr("width", box.width)
		.attr("height", box.height)
		.on("mouseover", startInteraction);

	// Start a transition that interpolates the data.
	svg.transition()
	    .duration(30000)
	    .ease("linear")
	    .tween("year", tweenYear) 
	    .each("end", startInteraction);

	    	function showTooltip(d, i) {

	    d3.select("#countryname").remove();
	    d3.selectAll(".dot").style("opacity", 0.2);

	    svg.append("text")
		.attr("id", "countryname")
		.attr("y", height - 10)
		.attr("x", 10)
		.text(d.name)
		.style("font-family", "Helvetica Neue")
		.style("font-size", 50)
		.style("fill", colorScale(color(d)));

	}


		function tweenYear() {
	    var year = d3.interpolateNumber(1990, 2009);
	    return function(t) { displayYear(year(t)); };
	}

		// Updates the display to show the specified year.
	function displayYear(year) {
	    dot.data(interpolateData(year), key).call(position).sort(order);
	    label.text(Math.round(year));
	}

	// After the transition finishes, you can mouseover to change the year.
	function startInteraction() {
	    var yearScale = d3.scale.linear()
		    .domain([1990, 2009])
		    .range([box.x + 10, box.x + box.width - 10])
		    .clamp(true);

	    // Cancel the current transition, if any.
	    svg.transition().duration(0);

	    overlay
		.on("mouseover", mouseover)
		.on("mouseout", mouseout)
		.on("mousemove", mousemove)
		.on("touchmove", mousemove);

	    function mouseover() {
		label.classed("active", true);
	    }

	    function mouseout() {
		label.classed("active", false);
	    }

	    function mousemove() {
		displayYear(yearScale.invert(d3.mouse(this)[0]));
	    }
	}

		d3.select("input").on("change", change);


	function change() {
	    this.checked ? svg.selectAll("path").style("visibility", "hidden")
		: svg.selectAll("path").style("visibility", "visible");
	}



	})





}


















