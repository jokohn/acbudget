var budget = (function (module) {

    /** constructor for budget model */
    module.Model = function (originalData) {

        // holds public methods and data
        var my = {
            data : originalData,
            DEFAULT_RADIUS : 65
        };

        /** add more properties to original data */
        my.processData = function(sizeName, width, height) {
            var radius = my.DEFAULT_RADIUS;
            var data = my.data;

            for (var j = 0; j < data.length; j++) {
                var d = data[j];
                d.x = d.x ? d.x : Math.random() * width;
                d.y = d.y ? d.y : Math.random() * height;
                d["Approved Amount"] = +d["Approved Amount"];
                d["Recommended Amount"] = +d["Recommended Amount"];
                d.approvedToRecommendedRatio = d["Approved Amount"] / d["Recommended Amount"];
                d.type = d["Approved Amount"] > 0 ? "Expenditure" : "Revenue";
                //console.log(j + " app="+ d["Approved Amount"] + " rec="+ d["Recommended Amount"]);

            }
            data.maximums = my.getMaximums();
            var rmax = data.maximums[sizeName];
            for (var k = 0; k < data.length; k++) {
                data[k].radius = (sizeName != '') ? radius * (Math.sqrt(data[k][sizeName]) / rmax) : 15;
            }
            data.maximums.radius = d3.max(_.pluck(data, "radius"));
            console.log("maxes= " + JSON.stringify(data.maximums));
            return data;
        };


        /** get maximum values for continuous variables. This could be a property of the data */
        my.getMaximums = function() {
            var data = my.data;
            var getMax = function(data, variable) {
                return Math.sqrt(d3.max(_.pluck(data, variable)));
            };
            return {
                'Approved Amount': getMax(data, 'Approved Amount'),
                'Recommended Amount': getMax(data, 'Recommended Amount'),
                'approvedToRecommendedRatio': getMax(data, 'approvedToRecommendedRatio')
            };
        };

        /** get the centers of the clusters using a treemap layout */
        my.getCenters = function(vname, size) {
            var centers, map;
            centers = _.uniq(_.pluck(my.data, vname)).map(function (d) {
                return {name: d, value: 1};
            });

            map = d3.layout.treemap().size(size).ratio(1);
            map.nodes({children: centers});

            return centers;
        };

        my.getColors = function() {
            var colors = {};
            var categoricColumns = ["Fiscal Year", "Program Area", "Budget Unit", "Major Object", "Expense Category", "Account Name"];
            _.each(categoricColumns, function(col) {
                colors[col] = d3.scale.category20().domain(my.data.map( function (d) { return d[col]; }));
            });
            return colors;
        };


        my.doFilter = function() {
            return _.filter(my.data, function(d) {
                return d.type == "Expenditure";
            });
        };


        return my;
    };

    return module;
}(budget || {}));


