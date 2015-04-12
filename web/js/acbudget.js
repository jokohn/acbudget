$(document).ready(function() {
    d3.csv("data/budget_data.csv", function (data) {
        var model = new budget.Model(data);
        create(model);
    });
});


/**
 * create the chart based on the data
 * @param model the budget datamodel.
 */
function create(model) {

    doFilter();
    var forceChart = budget.ForceChart("#chart", model);

    $('#groupSelect').change(function() {
        forceChart.setGroup(this.value);
        forceChart.render();
    });

    $('#sizeSelect').change(function() {
        forceChart.setSizeAttribute(this.value);
        forceChart.render();
    });

    $('#colorSelect').change(function() {
        forceChart.setColorAttribute(this.value);
    });

    $('#year-select').change(function() {
        doFilter();
        forceChart.setSizeAttribute($('#sizeSelect').value);
        forceChart.render();
    });

    $('#type-select').change(function() {
        doFilter();
        forceChart.setSizeAttribute($('#sizeSelect').value);
        forceChart.render();
    });

    function doFilter() {
        var isYear2014 = $("#year2014").is(":checked");
        var isExpenditure = $("#expenditure").is(":checked");
        var year = isYear2014 ? "2014" : "2015";
        var type = isExpenditure ? "Expenditure" : "Revenue";
        console.log("type  " + type + " year " + year);

        model.setFilter({"Fiscal Year":year, "type":type});
        //forceChart.render();
    }
}