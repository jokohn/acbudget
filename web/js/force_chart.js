var budget = (function (module) {

    /**
     * constructor for force chart
     * @param div unique jquery selector for the chart
     * @param model the data model to show
     */
    module.ForceChart = function (div, model) {

        var DEFAULT_COLOR = "#a58fff";

        // holds public methods and data
        var my = {
            model: model
        };

        var group = '';
        var size = '';
        var color = '';

        var data;
        var colors;
        var width, height;
        var svg;
        var posNodes;
        var force = d3.layout.force();
        //force.gravity(0).friction(0.9);

        /**
         * initialize the chart
         * @param div unique jquery selector for the chart
         */
        function init(div) {

            var chart = $(div);
            width = Math.max(chart.width(), 100);
            height = Math.max(chart.height(), 100);
            svg = d3.select(div).append("svg")
                .attr("width", width)
                .attr("height", height);

            data = model.processData(size, width, height);
            colors = model.getColors();

            posNodes = svg.selectAll("circle").data(model.doFilter());

            posNodes.enter().append("circle")
                .attr("class", "node")
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.x;
                })
                .attr("r", function (d) {
                    return d.radius;
                })
                .style("fill", function (d, i) {
                    return DEFAULT_COLOR;
                })
                .on("mouseover", function (d) {
                    showPopover.call(this, d);
                })
                .on("mouseout", function (d) {
                    removePopovers();
                })
                .append("text")
                .attr();

            my.setColor(color);
            my.setGroup(group);
            my.render();
        }

        var removePopovers = function() {
            $('.popover').each(function () {
                $(this).remove();
            });
        };

        var showPopover = function(d) {
            $(this).popover({
                placement: 'top auto',
                container: 'body',
                trigger: 'manual',
                html: true,
                content: function () {
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
        };


        my.setGroup = function(val) {
            group = val;
            var centers = model.getCenters(group, [width, height]);
            force.on("tick", tick(centers, group));
            labels(centers);
        };


        var labels = function(centers) {
            svg.selectAll(".label").remove();

            svg.selectAll(".label")
                .data(centers).enter().append("text")
                .attr("class", "label")
                .text(function (d) {
                    return d.name
                })
                .attr("transform", function (d) {
                    return "translate(" + (d.x + (d.dx / 2)) + ", " + (d.y + 20) + ")";
                });
        };

        my.setSize = function(sizeVal) {
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
        };

        my.setColor = function(val) {
            color = val;
            //console.log(val);
            d3.selectAll("circle")
                .transition()
                .duration(2000)
                .style('fill', function (d) {
                    return val ? colors[val](d[val]) : DEFAULT_COLOR;
                });

            $('.colors').empty();
            if (val) {
                var values = colors[val].domain();
                _.each(values, function (label) {
                    $('.colors').append('<div class="col-xs-1 color-legend" style="background:'
                    + colors[val](label) + ';">' + label + '</div>')
                });
            }
        };

        my.render = function() {
            force.start();
        };

        var tick = function(centers, varname) {
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
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    });
            }
        };

        var collide = function(alpha) {
            var quadtree = d3.geom.quadtree(data);
            return function (d) {
                var padding = 5;
                var r = d.radius + data.maximums["radius"] + padding,
                    nx1 = d.x - r,
                    nx2 = d.x + r,
                    ny1 = d.y - r,
                    ny2 = d.y + r;
                quadtree.visit(function (quad, x1, y1, x2, y2) {
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
        };

        init(div);
        return my;
    };

    return module;
}(budget || {}));



