
var PropiedadesUpwelling = new Object();
PropiedadesUpwelling.VariablesGlobales = ['map', 'startExtent', 'Series', 'serie1', 'serie2', 'UpwellingChart', 'sourceselected', 'yearselected', 'UpwellingTable', 'urlxml', 'arraysources'];

cargarvariablesGlobales();

function cargarvariablesGlobales() {
    $.each(PropiedadesUpwelling.VariablesGlobales, function (index, value) {
        PropiedadesUpwelling[value] = undefined;
    });
}
PropiedadesUpwelling.urlxml = "http://www.indicedeafloramiento.ieo.es/xml/";
PropiedadesUpwelling.arraysources = [];

//Función que prepara la tabla con las fuentes de datos incorporadas al gráfico
prepareTableSource();

//#region Selection and queries
//Onchange event select Source
$("select[name='source_list']").on('change', function () {
    PropiedadesUpwelling.sourceselected = $(this).find("option:selected").val();
    PropiedadesUpwelling.sourcetextselected = $(this).find("option:selected").text();
    PropiedadesUpwelling.yearselected = $("select[name='year_list']").find("option:selected").val();
    (PropiedadesUpwelling.sourceselected != "" && PropiedadesUpwelling.yearselected != "") ? $("#InsertButtonUpwelling").prop("disabled", false) : $("#InsertButtonUpwelling").prop("disabled", true);
    (PropiedadesUpwelling.sourceselected != "" && PropiedadesUpwelling.yearselected != "") ? $("#RemoveButtonUpwelling").prop("disabled", false) : $("#RemoveButtonUpwelling").prop("disabled", true);
    PropiedadesUpwelling.urlxml = PropiedadesUpwelling.urlxml + PropiedadesUpwelling.sourceselected + "_mensual.xml";
    console.log(PropiedadesUpwelling.urlxml);
});

//Onchange event select Year
$("select[name='year_list']").on('change', function () {
    PropiedadesUpwelling.yearselected = $(this).find("option:selected").val();
    PropiedadesUpwelling.sourceselected = $("select[name='source_list']").find("option:selected").val();
    (PropiedadesUpwelling.sourceselected != "" && PropiedadesUpwelling.yearselected != "") ? $("#InsertButtonUpwelling").prop("disabled", false) : $("#InsertButtonUpwelling").prop("disabled", true);
    (PropiedadesUpwelling.sourceselected != "" && PropiedadesUpwelling.yearselected != "") ? $("#RemoveButtonUpwelling").prop("disabled", false) : $("#RemoveButtonUpwelling").prop("disabled", true);
});


PropiedadesUpwelling.Series = [];

//#endregion

//#region Map
require([
    "esri/urlUtils",
    "esri/map",
    "esri/toolbars/navigation",
    "esri/dijit/BasemapToggle",
    "esri/dijit/OverviewMap",
    "esri/dijit/Legend",
    "esri/geometry/Extent",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/GraphicsLayer",
    "esri/InfoTemplate",
    "esri/geometry/webMercatorUtils",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojo/dom",
    "dojo/on",
    "dojo/_base/declare",
    "esri/config",
    "dojo/parser",
    "dojo/domReady!"
], function (urlUtils, Map, Navigation, BasemapToggle, OverviewMap, Legend, Extent,
    ArcGISDynamicMapServiceLayer, GraphicsLayer, InfoTemplate, webMercatorUtils, array, domConstruct, dom, on, declare, esriConfig, parser
) {
    esriConfig.defaults.io.proxyUrl = "../proxy/asp/proxy.ashx";
    parser.parse();

    //Variable con la extensión inicial del mapa 
    PropiedadesUpwelling.startExtent = new Extent(-50, 12, 0, 41, new esri.SpatialReference({ wkid: 4326 }));

    PropiedadesUpwelling.map = new Map("mapDiv", {
        extent: PropiedadesUpwelling.startExtent,
        center: [-20, 26],
        basemap: "oceans",
        logo: false
    });

    //#region Maxima extensión del mapa
    var navToolbar = new Navigation(PropiedadesUpwelling.map);
    //Constreñimos la extensión del mapa a la inicial por medio del evento onextentchange.
    on(PropiedadesUpwelling.map, "extent-change", function (extent) {
        var buffer = 20; //En mi caso 1 grado
        // set costraint extent to initExtent +buffer
        var constraintExtent = new esri.geometry.Extent(PropiedadesUpwelling.startExtent.xmin - buffer, PropiedadesUpwelling.startExtent.ymin - buffer, PropiedadesUpwelling.startExtent.xmax + buffer, PropiedadesUpwelling.startExtent.ymax + buffer);       
        if (!constraintExtent.contains(extent.extent) || !constraintExtent.intersects(extent.extent)) {
            // zoom back to previous extent
            navToolbar.zoomToPrevExtent();
        }
    });
    //#endregion

    //#region Layers

    PropiedadesUpwelling.UpwellingStationsLayer = new ArcGISDynamicMapServiceLayer("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/Upwelling_Estaciones/MapServer", {
        opacity: 0.8,
        id: "UpwellingStations",
        infoTemplates: {
            0: {
                infoTemplate: new InfoTemplate("${Titulo}", "Acronym: ${Fuente}<br>Latitude: ${Lat}<br>Longitude: ${Lon}"),
                layerUrl: "http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/Upwelling_Estaciones/MapServer/0"
            }
        }
    });

    PropiedadesUpwelling.UpwellingStationsLayer.setVisibleLayers([0]);

    PropiedadesUpwelling.layersIds = [{ "Name": "Upwelling Stations", "id": "UpwellingStations" }];

    PropiedadesUpwelling.map.addLayers([PropiedadesUpwelling.UpwellingStationsLayer]);

    //#endregion

});
//#endregion

//#region Get Data and prepare Series
function getxml() {
    if (existSource()) {
        var urlxml,
            xmldoc,
            sourceselected,
            yearselected;        

        sourceselected = $("select[name='source_list']").find("option:selected").val();
        yearselected = $("select[name='year_list']").find("option:selected").val();
        urlxml = "http://www.indicedeafloramiento.ieo.es/refrescaurl.php?url=http://www.indicedeafloramiento.ieo.es/xml/" + sourceselected + "_mensual.xml"
        console.log(urlxml);
        $.ajax({
            type: "POST",
            url: urlxml,
            dataType: "xml",
            success: function (xml) {
                xmldoc = xml;

                var bb = xmldoc.getElementsByTagName("ano").length;
              
                var dataserie = [];

                for (i = 0; i < bb; i++) {
                    if (yearselected == parseFloat(xmldoc.getElementsByTagName("ano")[i].childNodes[0].nodeValue)) {
                        dataserie.push(parseFloat(xmldoc.getElementsByTagName("ui")[i].childNodes[0].nodeValue));
                    }
                }

                PropiedadesUpwelling["serie_" + sourceselected + "_" + yearselected] = {
                    name: sourceselected + " " + yearselected,
                    data: dataserie,
                    color: newRandomColor()
                }

                PropiedadesUpwelling.Series.push(PropiedadesUpwelling["serie_" + sourceselected + "_" + yearselected]);

                addSerietoGraph();
            },
            //other code
            error: function (error) {
                console.log(error);
            }
        });
    }    
}

function newRandomColor() {
    var color = [];
    color.push((Math.random() * 255).toFixed());
    color.push((Math.random() * 255).toFixed());
    color.push((Math.random() * 255).toFixed());
    color.push((Math.random()).toFixed(2));
    var text = 'rgba(' + color.join(',') + ')';
    console.log(text);
    return text;
}

//#endregion

//#region Graphs
function addSerietoGraph() {
    if (existSource()) {
        require(['highcharts', 'exporting-highcharts'], function () {
            $('#tableSourceUpwelling').show();
            prepareTable();
            addsourcetoTable();
            var UpwellingChart = $('#graphicUpwelling').highcharts({

                chart: {
                    type: 'spline',
                },

                title: null,

                xAxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },
                yAxis: {
                    title: {
                        text: 'UI(m3*s-1*km-1)'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    formatter: function () {
                        return this.series.name + ' ' + this.x +
                            ': <b>' + this.y + '</b>' + ' UI(m3*s-1*km-1)';
                    },
                    //valueSuffix: 'UI(m3*s-1*km-1)'
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                },
                plotOptions: {                    
                    spline: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                series: PropiedadesUpwelling.Series
            });

            $("#graphicUpwelling").show();
            PropiedadesUpwelling.UpwellingChart = UpwellingChart.highcharts();
        });
    }    
}

function removeSerietoGraph() {
    console.log(PropiedadesUpwelling.arraysources);
    $.each(PropiedadesUpwelling.arraysources, function (index, value) {
        if (value['Acronym'] == PropiedadesUpwelling.sourceselected && value['Year'] == PropiedadesUpwelling.yearselected) {
            PropiedadesUpwelling.arraysources.splice(index, 1);
            PropiedadesUpwelling.UpwellingnodoTablaSource = $("[data-html-id='dataTableSourceUpwelling']");
            //nodoTabla.parent().addClass("estiloTabla");
            PropiedadesUpwelling.UpwellingTablaSource = PropiedadesUpwelling.UpwellingnodoTablaSource.DataTable({
                data: PropiedadesUpwelling.arraysources,
                "bPaginate": false,
                //"dom": "<'row'<'col-md-6'l><'col-md-6'f>><'row'<'col-md-6'B><'col-md-6'p>><'row'<'col-md-12't>><'row'<'col-md-12'i>>",
                'aoColumns': EsquemaColumnas,
                "language": {
                    "url": "  http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/English.json"
                },
                dom: 'Bfrtip',
                //buttons: [
                //    'copy', 'csv', 'pdf'
                //]

            });
            return false;
        }
    });
    
}

//#endregion


//#region Tables

//#region Table Sources
function prepareTableSource() {

    require(['datatables', 'datatables-bootstrap'], function () {
        var EsquemaColumnas,
        data,
    EsquemaColumnas = [];

        var itemsource = {}
        itemsource['title'] = 'Source';
        itemsource['data'] = 'Source';
        itemsource['width'] = '20%';

        var itemacronym = {}
        itemacronym['title'] = 'Acronym';
        itemacronym['data'] = 'Acronym';
        itemacronym['width'] = '20%';

        var itemyear = {}
        itemyear['title'] = 'Year';
        itemyear['data'] = 'Year';
        itemyear['width'] = '20%';

        EsquemaColumnas.push(itemsource, itemyear, itemacronym);

        PropiedadesUpwelling.UpwellingnodoTablaSource = $("[data-html-id='dataTableSourceUpwelling']");
        //nodoTabla.parent().addClass("estiloTabla");
        PropiedadesUpwelling.UpwellingTablaSource = PropiedadesUpwelling.UpwellingnodoTablaSource.DataTable({
            data: PropiedadesUpwelling.arraysources,
            "bPaginate": false,
            //"dom": "<'row'<'col-md-6'l><'col-md-6'f>><'row'<'col-md-6'B><'col-md-6'p>><'row'<'col-md-12't>><'row'<'col-md-12'i>>",
            'aoColumns': EsquemaColumnas,
            "language": {
                "url": "  http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/English.json"
            }

        });
    });
}

function addsourcetoTable() {

    require(['datatables', 'datatables-bootstrap'], function () {
        var EsquemaColumnas,
        data,
    EsquemaColumnas = [];

        var itemsource = {}
        itemsource['title'] = 'Source';
        itemsource['data'] = 'Source';
        itemsource['width'] = '20%';

        var itemacronym = {}
        itemacronym['title'] = 'Acronym';
        itemacronym['data'] = 'Acronym';
        itemacronym['width'] = '20%';

        var itemyear = {}
        itemyear['title'] = 'Year';
        itemyear['data'] = 'Year';
        itemyear['width'] = '20%';

        EsquemaColumnas.push(itemsource, itemyear, itemacronym);

        var itemdata = {};
        itemdata['Source'] = PropiedadesUpwelling.sourcetextselected;
        itemdata['Acronym'] = PropiedadesUpwelling.sourceselected;
        itemdata['Year'] = PropiedadesUpwelling.yearselected;
        PropiedadesUpwelling.arraysources.push(itemdata);

        if (PropiedadesUpwelling.UpwellingTablaSource != undefined) {
            PropiedadesUpwelling.UpwellingTablaSource.destroy();
            PropiedadesUpwelling.UpwellingnodoTablaSource.empty(); // empty in case the columns change
        }

        PropiedadesUpwelling.UpwellingnodoTablaSource = $("[data-html-id='dataTableSourceUpwelling']");
        //nodoTabla.parent().addClass("estiloTabla");
        PropiedadesUpwelling.UpwellingTablaSource = PropiedadesUpwelling.UpwellingnodoTablaSource.DataTable({
            data: PropiedadesUpwelling.arraysources,
            "bPaginate": false,
            //"dom": "<'row'<'col-md-6'l><'col-md-6'f>><'row'<'col-md-6'B><'col-md-6'p>><'row'<'col-md-12't>><'row'<'col-md-12'i>>",
            'aoColumns': EsquemaColumnas,
            "language": {
                "url": "  http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/English.json"
            },
            dom: 'Bfrtip',
            //buttons: [
            //    'copy', 'csv', 'pdf'
            //]

        });

        $("[data-html-id='dataTableSourceUpwelling']  tbody").on('click', 'tr', function (event) {
            if (event.shiftKey) {
                var tag = $(this).parent();
                $(this).addClass('selected-row');
            }

            else {
                if ($(this).hasClass('selected-row')) {
                    $(this).removeClass('selected-row');
                }
                else {
                    var tag = $(this).parent();
                    tag.find("tr").removeClass("selected-row");
                    $(this).addClass('selected-row');

                }
            }
        });

        $("#graphicUpwelling").show();
    });

    
   

}
//#endregion


//Function prepare Table data
function prepareTable(data) {
    var EsquemaColumnas,
        data,
        arraymonths;
    EsquemaColumnas = [];

    arraymonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var itemmonth = {}
    itemmonth['title'] = 'Month';
    itemmonth['data'] = 'Month';
    itemmonth['width'] = '20%';

    EsquemaColumnas.push(itemmonth);   

    $.each(PropiedadesUpwelling.Series, function (index, value) {
        var item = {};
        item['title'] = value.name;
        item['data'] = value.name;
        item['width'] = '20%';
        EsquemaColumnas.push(item);
        
    });

    data = [];
    $.each(arraymonths, function (index, value) {
        var item = {};
        item['Month'] = value;
        for (var i = 0; i < PropiedadesUpwelling.Series.length; i++) {
            if (PropiedadesUpwelling.Series[i].data[index] == undefined) {
                item[PropiedadesUpwelling.Series[i].name] = NaN;
            }
            else {
                item[PropiedadesUpwelling.Series[i].name] = PropiedadesUpwelling.Series[i].data[index];
            }
            
        }
        data.push(item);
    });
    createTable(EsquemaColumnas, data);

}

function createTable(EsquemaColumnas, data) {
    require(['datatables', 'datatables-bootstrap'], function () {
        console.log(EsquemaColumnas);
        console.log(data);
        if (PropiedadesUpwelling.UpwellingTable != undefined) {
            PropiedadesUpwelling.UpwellingTable.destroy();
            PropiedadesUpwelling.UpwellingnodoTabla.empty(); // empty in case the columns change
        }
        PropiedadesUpwelling.UpwellingnodoTabla = $("[data-html-id='dataTableUpwelling']");
        //nodoTabla.parent().addClass("estiloTabla");
        PropiedadesUpwelling.UpwellingTable = PropiedadesUpwelling.UpwellingnodoTabla.DataTable({
            data: data,
            "bPaginate": false,
            //"dom": "<'row'<'col-md-6'l><'col-md-6'f>><'row'<'col-md-6'B><'col-md-6'p>><'row'<'col-md-12't>><'row'<'col-md-12'i>>",
            'aoColumns': EsquemaColumnas,
            "language": {
                "url": "  http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/English.json"
            }

        });

        $("#tableUpwelling").show();
    })
    
}

//#endregion

function existSource() {
    var sourceselected,
        yearselected;
    if (PropiedadesUpwelling.arraysources.length > 0) {
        sourceselected = $("select[name='source_list']").find("option:selected").val();
        yearselected = $("select[name='year_list']").find("option:selected").val();
        var exist = true;
        $.each(PropiedadesUpwelling.arraysources, function (index, value) {
            if (value.Acronym == sourceselected && value.Year == yearselected) {
                exist = false;
                return false;
            }
        });
        return exist;
    }
    else {
        return true;
    }
}