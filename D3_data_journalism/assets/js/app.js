//Define SVG width and hiegh and margins
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);


// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d.chosenXAxis) * 0.8,
        d3.max(stateData, d => d.chosenXAxis) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// function used for updating y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d.chosenYAxis) * 0.8,
        d3.max(stateData, d => d.chosenYAxis) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }

// function used for updating yAxis var upon click on axis label
function renderAxes(newYScale, yAxis) {
    var leftAxis = d3.axisBottom(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function x_renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }

function y_renderCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xlabel;
    var ylabel;
  
    if (chosenXAxis === "poverty") {
      xlabel = "Poverty";
    }
    else if (chosenXAxis === "age") {
      xlabel = "Age (Median)";
    } 
    else {
      xlabel = "Income (Median)";
    }

    if (chosenYAxis === "healthcare") {
        ylabel = "Healthcare:";
      }
      else if (chosenXAxis === "smokes") {
        ylabel = "Smokes";
      } 
      else {
        ylabel = "Obesity";
      }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${xlabel}: ${d.chosenXAxis} <br>${ylabel}: ${d.chosenYAxis}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }
     


// Retrieve data from the CSV file and execute everything below
d3.csv(`assets/data/data.csv`).then(function(stateData, err) {
    if (err) throw err;

    var states_abbr = stateData.map(row => row.abbr);
    console.log(states_abbr);

  // parse data
  stateData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });


   // xLinearScale function above csv import
  var xLinearScale = xScale(stateData, chosenXAxis);

  // yLinearScale function above csv import
  var yLinearScale = yScale(stateData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis); 

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.chosenXAxis))
    .attr("cy", d => yLinearScale(d.chosenYAxis))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");  
  
  // Create group for three x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Household Income (Median)");



    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0 - margin.left}, ${ 0- (height /2) })`);

    var healthcareLabel = ylabelsGroup.append("text")
    .attr("x", 60)
    .attr("y", 0)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
    .attr("x", 40)
    .attr("y", 0)
    .attr("value", "smokes") // value to grab for event listener
    .classed("active", true)
    .text("Smokes (%)");

    var obesityLabel = ylabelsGroup.append("text")
    .attr("x", 20)
    .attr("y", 0)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity (%)");
 
  
  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() { 

    // x axis labels event listener
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {    

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(stateData, chosenXAxis);
            
            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);
            
            // updates circles with new x values
            circlesGroup = x_renderCircles(circlesGroup, xLinearScale, chosenXAxis);
            
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            
            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                  .classed("active", true)
                  .classed("inactive", false);
                ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
                incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else if (chosenXAxis === "age") {
                povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
                ageLabel
                  .classed("active", true)
                  .classed("inactive", false);
                incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);                  
              } 
              else {
                povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
                ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
                incomeLabel
                  .classed("active", true)
                  .classed("inactive", false);      
              }
        }
    });

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
  .on("click", function() { 
    // y axis labels event listener    
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {            

            // replaces chosenXAxis with value
            chosenYAxis = value;

            // console.log(chosenYAxis)

            // functions here found above csv import
            // updates y scale for new data
            yLinearScale = yScale(stateData, chosenYAxis);
            
            // updates y axis with transition
            yAxis = renderAxes(yLinearScale, yAxis);
            
            // updates circles with new y values
            circlesGroup = y_renderCircles(circlesGroup, yLinearScale, chosenYAxis);
            
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            
            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
                healthcareLabel
                  .classed("active", true)
                  .classed("inactive", false);
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else if (chosenYAxis === "smokes") {
                healthcareLabel
                  .classed("active", false)
                  .classed("inactive", true);
                smokesLabel
                  .classed("active", true)
                  .classed("inactive", false);
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);                  
              } 
              else {
                healthcareLabel
                  .classed("active", false)
                  .classed("inactive", true);
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
                obesityLabel
                  .classed("active", true)
                  .classed("inactive", false);      
              }            
        }
    });
}).catch(function(error) {
  console.log(error);
});