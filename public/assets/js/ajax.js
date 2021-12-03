let enabledProperties = undefined;

$(document).ready(function () {
    let table = document.getElementById('table_body');
    let table_head = document.getElementById('table_head');
    let selectProperties = document.getElementById('prop_selection');
    let status = document.getElementById('status');

    //show all properties
    $.ajax({
        type: "GET",
        url: "/properties",
        async: true,
        success: function (data) {
            getEnabledProperties(data);
        }
    });

    //show all countries
    $.ajax({
        type: "GET",
        url: "/items",
        async: true,
        success: function (data) {
            createTable(data);
        }
    });

    //filter countries
    $('#country_filter').submit(function (e) {
        e.preventDefault();
        let content = [];
        let id = $('#country_filter_id').val();
        let range = $('#country_filter_range').val();
        let beginning = range.split('-')[0];
        let end = range.split('-')[1];

        $.ajax({
            type: "GET",
            url: "/items/" + id,
            async: true,
            success: function (data) {
                if (String(data).includes("No such id")) {
                    errorMessage(data);
                }
                content.push(data);
                createTable(content);

                $.ajax({
                    type: "GET",
                    url: "/items/" + beginning + "/" + end,
                    async: true,
                    success: function (data) {
                        if (String(data).includes("Range")) {
                            errorMessage(data);
                        }
                        Array.prototype.push.apply(content, data);
                        createTable(content);
                    }
                });
            }
        });
    });

    //show properties
    $('#show_selected_prop').on('click', function () {
        let property = $('#prop_selection').val();
        
        $.ajax({
            type: "GET",
            url: "/properties/" + property,
            async: true,
            success: function (data) {
                if (String(data).includes("No such property")) {
                    errorMessage(data);
                }
                enabledProperties[data] = true;
                
                $.ajax({
                    type: "GET",
                    url: "/items",
                    async: true,
                    success: function (data) {
                        createTable(data);
                    }
                });
            }
        });
    });

    //hide properties
    $('#hide_selected_prop').on('click', function () {
        let property = $('#prop_selection').val();
        
        $.ajax({
            type: "GET",
            url: "/properties/" + property,
            async: true,
            success: function (data) {
                if (String(data).includes("No such property")) {
                    errorMessage(data);
                }
                enabledProperties[data] = false;
                
                $.ajax({
                    type: "GET",
                    url: "/items",
                    async: true,
                    success: function (data) {
                        createTable(data);
                    }
                });
            }
        });
    });

    //add countries
    $('#country_add').submit(function (e) {
        e.preventDefault();
        
        $.ajax({
            type: "POST",
            url: "/items",
            data: JSON.stringify({
                name: $('#country_name').val(),
                birth_rate_per_1000: $('#country_birth').val(),
                cell_phones_per_100: $('#country_cellphone').val()
            }),
            contentType: "application/json",
            dataType: "text",
            success: function (data) {
                successMessage(data);
            }
        });
        
        $.ajax({
            type: "GET",
            url: "/items",
            async: true,
            success: function (data) {
                createTable(data);
            }
        });
    });

    //delete countries
    $('#country_delete').submit(function (e) {
        e.preventDefault();
        $.ajax({
            type: "DELETE",
            url: "/items/" + id,
            async: true,
            success: function (data) {
                if (data.toLowerCase().includes("deleted")) {
                    successMessage(data);
                } else {
                    errorMessage(data);
                }

                $.ajax({
                    type: "GET",
                    url: "/items",
                    async: true,
                    success: function (data) {
                        createTable(data);
                    }
                });
            }
        });

        let id = $('#country_delete_id').val();
    });


    function getEnabledProperties(data) {
        enabledProperties = [];
        let result = '';
        let i = 0;

        for (let key in data) {
            i++;
            enabledProperties[data[key]] = true;
            if (i > 2 && i < 8) {
                result += '<option value="' + key + '">';
                result += data[key];
                result += '</option>';
            }
        }
        selectProperties.innerHTML = result;
    }
    
    function createTable(data) {
        let result = '';
        let head = '';

        for (let i = 0; i < data.length; i++) {
            result += '<tr>';

            let index = 0;
            for (let key in data[i]) {
                if (index > 6) {
                    break;
                }
                if (!enabledProperties[key]) {
                    index++;
                    continue;
                }


                if (index === 0) {
                    if (i < 9) {
                        result += '<td>00' + (i + 1) + '</td>';
                    } else {
                        if (i < 99) {
                            result += '<td>0' + (i + 1) + '</td>';
                        } else {
                            result += '<td>' + (i + 1) + '</td>';
                        }
                    }
                } else {
                    result += '<td>' + data[i][key] + '</td>';
                }


                if (i === 0) {
                    if (key === "name") {
                        head += '<th>' + "COUNTRY" + '</th>';
                    }
                    if (key === "id") {
                        head += '<th>' + key.toUpperCase() + '</th>';
                    }
                    if (key === "birth_rate_per_1000") {
                        head += '<th>' + "BIRTH RATE PER / 1000" + '</th>';
                    }
                    if (key === "cell_phones_per_100") {
                        head += '<th>' + "CELL PHONES / 100" + '</th>';
                    }
                    if (key === "children_per_woman") {
                        head += '<th>' + "CHILDREN / WOMAN" + '</th>';
                    }
                    if (key === "electricity_consumption_per_capita") {
                        head += '<th>' + "ELECTRICITY CONSUMPTION / CAPITA" + '</th>';
                    }
                    if (key === "gdp_per_capita") {
                        head += '<th>' + "GDP / CAPITA" + '</th>';
                    }
                }
                index++;
            }

            result += '</tr>';
        }

        table.innerHTML = result;
        table_head.innerHTML = head;
    }

    /*Messages*/
    function successMessage(data) {
        status.innerHTML = '<div class="success"><strong>' + data + '</strong></div>';
    }

    function errorMessage(data) {
        status.innerHTML = '<div class="failure"><strong>' + data + '</strong></div>';
    }

    status.onclick = function () {
        let div = document.getElementById('status').children;
        div[0].style.opacity = "0";
        setTimeout(function () {
            div[0].style.display = "none";
        }, 600);
    }
});