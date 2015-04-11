    $(document).ready(function() {
        d3.csv("data/budget_data.csv", function (data) {
            var model = new budget.Model(data);
            create(model);
        });
    });
    
    var group = '';
    var size = '';
    var color = '';

    /**
     * create the chart based on the data
     * @param model the budget datamodel.
     */
    function create(model) {
        var defaultColor = "#a58fff";
        
        var chart = $("#chart");
        var width = Math.max(chart.width(), 100);
        var height = Math.max(chart.height(), 100);
        var svg = d3.select("#chart").append("svg")
            .attr("width", width)
            .attr("height", height);

        data = model.processData(size, width, height);
        var colors = model.getColors();

        var posNodes = svg.selectAll("circle").data(model.doFilter());

        posNodes.enter().append("circle")
          .attr("class", "node")
          .attr("cx", function (d) { return d.x; })
          .attr("cy", function (d) { return d.x; })
          .attr("r", function (d) { return d.radius; })
          .style("fill", function (d, i) { return defaultColor; })
          .on("mouseover", function (d) { showPopover.call(this, d); })
          .on("mouseout", function (d) { removePopovers(); })
          .append("text")
          .attr();

        $('#group').change(function() {
          group = this.value;
          draw(group);
        });

        $('#size').change(function() {
          var sizeVal = this.value;
          data = model.processData(sizeVal, width, height);

          d3.selectAll("circle")
            .data(model.doFilter())
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
          //console.log(val);
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
          var centers = model.getCenters(varname, [width, height]);
          force.on("tick", tick(centers, varname));
          labels(centers);
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