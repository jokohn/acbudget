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
}