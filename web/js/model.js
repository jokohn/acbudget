var budget = (function (module) {

    /** constructor for budget model */
    module.Model = function (originalData) {

        var DEFAULT_RADIUS = 65;
        var NUMBER_FORMAT = d3.format(",.0f");
        var DEFAULT_COLOR = "#a58fff";
        // the tooltip dimensions to show in order
        var TIP_DIMENSIONS = ['Program Area', 'Department', 'Account Name', 'Expense Category', 'Major Object', 'Budget Unit'];


        // holds public methods and data
        var my = {
            width: 200,
            height: 200,
            filters: {"Fiscal Year":"2015", "type":"Expenditure"},
            group : '',
            sizeAttr : '',
            colorAttr : ''
        };

        /** do first time processing of the data once */
        function init(originalData) {
            var data = originalData;

            for (var j = 0; j < data.length; j++) {
                var d = data[j];
                d.id = d["Program Area"] +","+ d["Budget Unit"] + "," + d["Department"]
                    + "," + d["Major Object"] + "," + d["Expense Category"] + "," + d["Account Name"];
                d.x = Math.random() * my.width;
                d.y = Math.random() * my.height;
                var approvedAmt =  +d["Approved Amount"];
                d.type = approvedAmt > 0 ? "Expenditure" : "Revenue";
                d["Approved Amount"] = Math.abs(+d["Approved Amount"]);
                d["Recommended Amount"] = Math.abs(+d["Recommended Amount"]);
                d.approvedToRecommendedRatio = d["Approved Amount"] / d["Recommended Amount"];
            }
            my.colors = computeColors(data);
            my.data = data;
            my.processData()
        }

        /** add more properties to original data */
        my.processData = function() {
            var data = my.data;
            var filteredData = [];

            for (var j = 0; j < data.length; j++) {
                var d = data[j];
                if (d['type'] == my.filters['type'] && d['Fiscal Year'] == my.filters['Fiscal Year']) {
                    filteredData.push(d);
                }
            }

            filteredData.maximums = getMaximums(filteredData);
            if (my.sizeAttr) {
                var rmax = filteredData.maximums[my.sizeAttr];
                for (var k = 0; k < filteredData.length; k++) {
                    filteredData[k].radius = (my.sizeAttr != '') ? DEFAULT_RADIUS * (Math.sqrt(filteredData[k][my.sizeAttr]) / rmax) : 15;
                }
                filteredData.maximums.radius = d3.max(_.pluck(filteredData, "radius"));
            }

            //console.log("numPoints = " + filteredData.length +"  maxs= " + JSON.stringify(filteredData.maximums));
            my.filteredData = filteredData;
            return filteredData;
        };

        my.setSize = function(width, height) {
            my.width = width;
            my.height = height;
            var data = my.data;
            /*
            for (var j = 0; j < data.length; j++) {
                var d = data[j];
                d.x = d.initialX;
                d.y = d.initialY;
            }*/
        };

        my.getColorValues = function() {
            return my.colorAttr ? my.getColors().domain() : [];
        };

        my.getColor = function(row) {
                return my.colorAttr ? my.getColors()(row[my.colorAttr]) : DEFAULT_COLOR;
        };

        my.getColorForValue = function(val) {
            return my.colorAttr ? my.getColors()(val) : DEFAULT_COLOR;
        };

        /** get maximum values for continuous variables. This could be a property of the data */
        var getMaximums = function(data) {
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
        my.getCenters = function() {
            var centers, map;
            centers = _.uniq(_.pluck(my.data, my.group)).map(function (d) {
                return {name: d, value: 1};
            });

            map = d3.layout.treemap().size([my.width, my.height]).ratio(1);
            map.nodes({children: centers});

            return centers;
        };

        var computeColors = function(data) {
            var colors = {};
            var categoricColumns = ["Fiscal Year", "Program Area", "Department",
                "Budget Unit", "Major Object", "Expense Category", "Account Name"
            ];
            _.each(categoricColumns, function(col) {
                colors[col] = d3.scale.category20().domain(data.map( function (d) { return d[col]; }));
            });
            return colors;
        };

        my.getColors = function() {
            return my.colors[my.colorAttr];
        };

        my.setFilter = function(filters) {
            my.filters = filters;
        };


        my.keyFunc = function(d) {
            return d.id;
        };

        my.serialize = function(d) {
            var tip = " --- <b>" + d.type + " for " +  d['Fiscal Year'] +"</b> --- <br/>";
            _.each(TIP_DIMENSIONS, function(dimension) {
                if (dimension == my.group) {
                    tip += "<span class='selected-tip-dimension'><b>" + dimension + ": </b>" + d[dimension] + "</span><br/>";
                } else if (dimension == my.colorAttr) {
                    tip += "<span class='selected-tip-dimension'><b>" + dimension + ": </b>" + d[dimension] + "</span><br/>";
                }
                else {
                    tip += "<b>" + dimension + ": </b>" + d['Department'] + "<br/>";
                }
            });
            tip +=
                "<b>Approved Amount:</b> $" + NUMBER_FORMAT(d['Approved Amount']) + "<br />" +
                "<b>Recommended Amount:</b> $" + NUMBER_FORMAT(d['Recommended Amount']);
            return tip;
        };

        init(originalData);

        return my;
    };

    return module;
}(budget || {}));


