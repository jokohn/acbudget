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

    $('#group').change(function() {
        forceChart.setGroup(this.value);
        forceChart.render();
    });

    $('#size').change(function() {
        forceChart.setSizeAttribute(this.value);
        forceChart.render();
    });

    $('#color').change(function() {
        forceChart.setColorAttribute(this.value);
    });
}