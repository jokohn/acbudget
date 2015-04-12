var budget = (function (module) {

    /** constructor for budget model */
    module.Model = function (originalData) {

        // holds public methods and data
        var my = {
            width: 200,
            height: 200,
            filters: {"Fiscal Year":"2015", "type":"Expenditure"},
            DEFAULT_RADIUS : 65
        };

        /** do first time processing of the data once */
        function init(originalData) {
            var data = originalData;

            for (var j = 0; j < data.length; j++) {
                var d = data[j];
                d.x = Math.random() * my.width;
                d.y = Math.random() * my.height;
                var approvedAmt =  +d["Approved Amount"];
                d.type = approvedAmt > 0 ? "Expenditure" : "Revenue";
                d["Approved Amount"] = Math.abs(+d["Approved Amount"]);
                d["Recommended Amount"] = Math.abs(+d["Recommended Amount"]);
                d.approvedToRecommendedRatio = d["Approved Amount"] / d["Recommended Amount"];
            }
            my.data = data;
        }

        /** add more properties to original data */
        my.processData = function(sizeName) {
            var radius = my.DEFAULT_RADIUS;
            var data = my.data;
            var filteredData = [];

            for (var j = 0; j < data.length; j++) {
                var d = data[j];
                if (d['type'] == my.filters['type'] && d['Fiscal Year'] == my.filters['Fiscal Year']) {
                    filteredData.push(d);
                }
            }

            filteredData.maximums = my.getMaximums(filteredData);
            var rmax = filteredData.maximums[sizeName];
            for (var k = 0; k < filteredData.length; k++) {
                filteredData[k].radius = (sizeName != '') ? radius * (Math.sqrt(filteredData[k][sizeName]) / rmax) : 15;
            }
            filteredData.maximums.radius = d3.max(_.pluck(filteredData, "radius"));
            console.log("maxes= " + JSON.stringify(filteredData.maximums));
            my.filteredData = filteredData;
            return filteredData;
        };

        my.setSize = function(width, height) {
            my.width = width;
            my.height = height;
            var data = my.data;

            for (var j = 0; j < data.length; j++) {
                var d = data[j];
                d.x = Math.random() * my.width;
                d.y = Math.random() * my.height;
            }
        };

        /** get maximum values for continuous variables. This could be a property of the data */
        my.getMaximums = function(data) {
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
        my.getCenters = function(vname) {
            var centers, map;
            centers = _.uniq(_.pluck(my.filteredData, vname)).map(function (d) {
                return {name: d, value: 1};
            });

            map = d3.layout.treemap().size([my.width, my.height]).ratio(1);
            map.nodes({children: centers});

            return centers;
        };

        my.getColors = function() {
            var colors = {};
            var categoricColumns = ["Fiscal Year", "Program Area", "Budget Unit", "Major Object", "Expense Category", "Account Name"];
            _.each(categoricColumns, function(col) {
                colors[col] = d3.scale.category20().domain(my.filteredData.map( function (d) { return d[col]; }));
            });
            return colors;
        };

        my.setFilter = function(filters) {
            my.filters = filters;
        };

        init(originalData);

        return my;
    };

    return module;
}(budget || {}));


