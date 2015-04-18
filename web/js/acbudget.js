$(document).ready(function() {
    d3.csv("data/budget_data.csv", function (data) {
        var model = new budget.Model(data);
        create(model);
    });
});


/**
 * create the chart based on the data
 * TODO:
 *   - why does it jump twice when changing group by?
 *   - show changes from prior year
 *   - only colors for unique values in filtered data
 *   - jitter y of group layout so there is not so much overlap
 *
 *
 * @param model the budget datamodel.
 */
function create(model) {

    doFilter();
    var forceChart = budget.ForceChart("#chart", model);

    var groupSelect = $('#groupSelect');
    var sizeSelect = $('#sizeSelect');
    var colorSelect = $('#colorSelect');
    colorSelect.find('option:contains("Account Name")').prop('selected', true);
    groupSelect.find('option:contains("Program Area")').prop('selected', true);
    sizeSelect.find('option:contains("Approved Amount")').prop('selected', true);

    forceChart.setGroup(groupSelect.find(":selected").attr("value"));
    forceChart.setSizeAttribute(sizeSelect.find(":selected").attr("value"));
    forceChart.setColorAttribute(colorSelect.find(":selected").attr("value"));
    forceChart.render();


    groupSelect.change(function() {
        forceChart.setGroup(this.value);
        forceChart.render();
    });

    sizeSelect.change(function() {
        forceChart.setSizeAttribute(this.value);
        forceChart.render();
    });

    colorSelect.change(function() {
        forceChart.setColorAttribute(this.value);
        forceChart.render();
    });

    $('#year-select').change(function() {
        doFilter();
        var sizeAttr = sizeSelect.find(":selected").attr("value");
        forceChart.setSizeAttribute(sizeAttr);
        forceChart.render();
    });

    $('#type-select').change(function() {
        doFilter();
        var sizeAttr = sizeSelect.find(":selected").attr("value");
        forceChart.setSizeAttribute(sizeAttr);
        forceChart.render();
    });


    function doFilter() {
        var isYear2014 = $("#year2014").is(":checked");
        var isExpenditure = $("#expenditure").is(":checked");
        var year = isYear2014 ? "2014" : "2015";
        var type = isExpenditure ? "Expenditure" : "Revenue";
        console.log("type  " + type + " year " + year);

        model.setFilter({"Fiscal Year":year, "type":type});
    }
}