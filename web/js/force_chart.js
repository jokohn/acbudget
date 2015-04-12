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
        var sizeAttr = '';
        var colorAttr = '';

        var chart;
        var filteredData;
        var colors;
        var svg;
        var posNodes;
        var force = d3.layout.force();
        //force.gravity(0).friction(0.9);

        /**
         * initialize the chart
         * @param div unique jquery selector for the chart
         */
        function init(div) {

            chart = $(div);
            svg = d3.select(div).append("svg");

            my.onResize();
            //chart.resize(my.onResize);

            filteredData = model.processData(sizeAttr);
            colors = model.getColors();

            posNodes = svg.selectAll("circle").data(filteredData, keyFunc);

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

            my.setColorAttribute(colorAttr);
            my.setGroup(group);
        }

        my.onResize = function() {
            width = Math.max(chart.width(), 100);
            height = Math.max(chart.height(), 100);
            model.setSize(width, height);
            //console.log("w="+ width + " h=" + height);
            svg.attr("width", width)
                .attr("height", height);
        };

        my.setGroup = function(val) {
            group = val;
            var centers = model.getCenters(group);
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

        my.setSizeAttribute = function(sizeVal) {
            filteredData = model.processData(sizeVal);
            sizeAttr = sizeVal;
        };

        my.setColorAttribute = function(val) {
            colorAttr = val;

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
            console.log("render anim");
            var circles = d3.selectAll("circle"); //.data(filteredData, keyFunc);

            circles
                .transition()
                .duration(2000)
                .attr('r', function(d, i) {
                    return sizeAttr ? d.radius : 15
                })
                .attr('cx', function(d) { return d.x })
                .attr('cy', function(d) { return d.y })
                .style('fill', function (d) {
                    return colorAttr ? colors[colorAttr](d[colorAttr]) : DEFAULT_COLOR;
                });

            console.log("render force");
            force.start();
        };

        var keyFunc = function(d) {
            return d.id;
        };

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
                    return model.serialize(d);
                }
            });
            $(this).popover('show')
        };


        var tick = function(centers, varname) {
            var focis = {};
            for (var i = 0; i < centers.length; i++) {
                focis[centers[i].name] = centers[i];
            }
            return function (e) {
                for (var i = 0; i < filteredData.length; i++) {
                    var item = filteredData[i];
                    var foci = focis[item[varname]];
                    item.y += ((foci.y + (foci.dy / 2)) - item.y) * e.alpha;
                    item.x += ((foci.x + (foci.dx / 2)) - item.x) * e.alpha;
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
            var quadtree = d3.geom.quadtree(filteredData);
            return function (d) {
                var padding = 5;
                var r = d.radius + filteredData.maximums["radius"] + padding,
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



