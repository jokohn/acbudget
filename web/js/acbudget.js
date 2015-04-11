    
	$( document ).ready(function() {
       start();
	});
	
	var start = function() {
		var prel = d3.select("pre#data");
        var results = d3.csv.parse(prel.text());
        create(results);
    }
    
    var group = '';
    var size = '';
    var color = '';

    

    /** create the chart based on the data */
    function create(data) {      
        var defaultColor = "#a58fff";     
        
        var chart = $("#chart");
        var width = Math.max(chart.width(), 100);
        var height = Math.max(chart.height(), 100);
        var svg = d3.select("#chart").append("svg")
            .attr("width", width)
            .attr("height", height);

        data = getDataMapping(data, size, width, height);
        var colors = getColors(data);

        var posNodes = svg.selectAll("circle").data(doFilter(data));

        posNodes.enter().append("circle")
          .attr("class", "node")
          .attr("cx", function (d) { return d.x; })
          .attr("cy", function (d) { return d.x; })
          .attr("r", function (d) { return d.radius; })
          .style("fill", function (d, i) { return defaultColor; })
          .on("mouseover", function (d) { showPopover.call(this, d); })
          .on("mouseout", function (d) { removePopovers(); })
          .append("text")
          .attr()

        $('#group').change(function() {
          group = this.value;
          draw(group);
        });

        $('#size').change(function() {
          var sizeVal = this.value;
          data = getDataMapping(data, sizeVal, width, height);  

           d3.selectAll("circle")
            .data(doFilter(data))
            .transition()
            .duration(2000)
            .attr('r', function(d, i) { 
                return sizeVal ? d.radius : 15 
            })
            .attr('cx', function(d) { return d.x })
            .attr('cy', function(d) { return d.y });

          size = sizeVal;
          force.start();
        });

        $('#color').change(function() {
          color = this.value;
          changeColor(this.value);
        });

        function changeColor(val) {
          console.log(val);
          d3.selectAll("circle")
            .transition()
            .duration(2000)
            .style('fill', function(d) { 
                return val ? colors[val](d[val]) : defaultColor;    
            });
            
          $('.colors').empty();
          if (val) {
              var values = colors[val].domain();
              _.each(values, function(label) {
                 $('.colors').append('<div class="col-xs-1 color-legend" style="background:'
                                  + colors[val](label) + ';">'+label+'</div>')
              });
          }
        }
        

        var force = d3.layout.force();
        //force.gravity(0).friction(0.9);

        changeColor(color);
        draw(group);

        function draw(varname) {
          var centers = getCenters(data, varname, [width, height]);
          force.on("tick", tick(centers, varname));
          labels(centers)
          force.start();
        }

        function tick (centers, varname) {
          var foci = {};
          for (var i = 0; i < centers.length; i++) {
            foci[centers[i].name] = centers[i];
          }
          return function (e) {
            for (var i = 0; i < data.length; i++) {
              var o = data[i];
              var f = foci[o[varname]];
              o.y += ((f.y + (f.dy / 2)) - o.y) * e.alpha;
              o.x += ((f.x + (f.dx / 2)) - o.x) * e.alpha;
            }
            posNodes.each(collide(.11))
              .attr("cx", function (d) { return d.x; })
              .attr("cy", function (d) { return d.y; });
          }
        }

        function labels (centers) {
          svg.selectAll(".label").remove();

          svg.selectAll(".label")
          .data(centers).enter().append("text")
          .attr("class", "label")
          .text(function (d) { return d.name })
          .attr("transform", function (d) {
            return "translate(" + (d.x + (d.dx / 2)) + ", " + (d.y + 20) + ")";
          });
        }

        function removePopovers () {
          $('.popover').each(function() {
            $(this).remove();
          }); 
        }

        function showPopover (d) {
          $(this).popover({
            placement: 'top auto',
            container: 'body',
            trigger: 'manual',
            html : true,
            content: function() { 
              var format = d3.format(",.0f");
              return "Account Name: " + d['Account Name'] + "<br />" +
              "Program Area: " + d['Program Area'] + "<br />" +              
              "Expense Category: " + d['Expense Category'] + "<br />" +
              "Major Object: " + d['Major Object'] + "<br />" +
              "Budget Unit: " + d['Budget Unit'] + "<br />" +
              "Department: " + d['Department'] + "<br />" +
              "Program Area: " + d['Program Area'] + "<br />" +
              "Fiscal Year: " + d['Fiscal Year'] + "<br />" +
              "Approved Amount: $" + format(d['Approved Amount']) + "<br />" +
              "Recommended Amount: $" + format(d['Recommended Amount']); 
            }
          });
          $(this).popover('show')
        }

        function collide(alpha) {
          var quadtree = d3.geom.quadtree(data);
          return function (d) {
            var padding = 5;
            var r = d.radius + data.maximums["radius"] + padding,
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
              if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                    y = d.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + quad.point.radius + padding;
                if (l < r) {
                  l = (l - r) / l * alpha;
                  d.x -= x *= l;
                  d.y -= y *= l;
                  quad.point.x += x;
                  quad.point.y += y;
                }
              }
              return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
          };
        }
      }


function doFilter(rows) {
    return _.filter(rows, function(d) {
        return d.type == "Expenditure";
    });
}

/** Add more properties do the initial data rows */
function getDataMapping(data, sizeName, width, height) {
    var radius = 65;
    
    for (var j = 0; j < data.length; j++) {    
        var d = data[j]
        d.x = d.x ? d.x : Math.random() * width;
        d.y = d.y ? d.y : Math.random() * height;
        d["Approved Amount"] = +d["Approved Amount"];
        d["Recommended Amount"] = +d["Recommended Amount"];
        d.approvedToRecommendedRatio = d["Approved Amount"] / d["Recommended Amount"];
        d.type = d["Approved Amount"] > 0 ? "Expenditure" : "Revenue";
        console.log(j + " app="+ d["Approved Amount"] + " rec="+ d["Recommended Amount"]);
        
    }    
    data.maximums = getMaximums(data);
    var rmax = data.maximums[sizeName];
    for (var j = 0; j < data.length; j++) {    
        data[j].radius = (sizeName != '') ? radius * (Math.sqrt(data[j][sizeName]) / rmax) : 15;
    }
    data.maximums.radius = d3.max(_.pluck(data, "radius"));
    console.log("maxes= " + JSON.stringify(data.maximums));
    return data;
};

/** get maximum values for continuous variables. This could be a property of the data */
function getMaximums(data) {
    var getMax = function(data, variable) {
        return Math.sqrt(d3.max(_.pluck(data, variable)));
    };    
    return {
        'Approved Amount': getMax(data, 'Approved Amount'),
        'Recommended Amount': getMax(data, 'Recommended Amount'),
        'approvedToRecommendedRatio': getMax(data, 'approvedToRecommendedRatio')
    };
};

function getColors(data) {
    var colors = {};
    var categoricColumns = ["Fiscal Year", "Program Area", "Budget Unit", "Major Object", "Expense Category", "Account Name"];
    _.each(categoricColumns, function(col) {
        colors[col] = d3.scale.category20().domain(data.map( function (d) { return d[col]; }));
    });
    return colors;
}

/** get the centers of the clusters using a treemap layout */
function getCenters(data, vname, size) {
    var centers, map;
    centers = _.uniq(_.pluck(data, vname)).map(function (d) {
        return {name: d, value: 1};
    });
    
    map = d3.layout.treemap().size(size).ratio(1/1);
    map.nodes({children: centers});
    
    return centers;
};
