﻿
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
    PropiedadesUpwelling.urlxml = PropiedadesUpwelling.urlxml + PropiedadesUpwelling.sourceselected + "_mensual.xml";
    console.log(PropiedadesUpwelling.urlxml);
});

//Onchange event select Year
$("select[name='year_list']").on('change', function () {
    PropiedadesUpwelling.yearselected = $(this).find("option:selected").val();
    PropiedadesUpwelling.sourceselected = $("select[name='source_list']").find("option:selected").val();
    (PropiedadesUpwelling.sourceselected != "" && PropiedadesUpwelling.yearselected != "") ? $("#InsertButtonUpwelling").prop("disabled", false) : $("#InsertButtonUpwelling").prop("disabled", true);
});



$.ajax({
    type: "get",
    url: "http://localhost:29128/App_Data/HFNMOC_mensual.xml",
    dataType: "jsonp",
    success: function (data) {
        /* handle data here */
        console.log(data);
    },
    error: function (xhr, status) {
        /* handle error here */
        console.log(xhr);
        console.log(status);
    }
});

var xmlDoc
$.ajax({
    type: "POST",
    url: "http://localhost:29128/App_Data/HFNMOC_mensual.xml",
    dataType: "json",
    success: function (xml) {
        console.log('hecho');
        xmlDoc = loadXMLDoc(xml),
        console.log(xmlDoc);
    },
    //other code
    error: function (error) {
        console.log(error);
    }
});


//xmldoc = loadXMLDoc("http://localhost:29128/App_Data/HFNMOC_mensual.xml");
//xmldoc = loadXMLDoc("http://www.indicedeafloramiento.ieo.es/xml/HFNMOC_mensual.xml");
//console.log(xmldoc);
//var bb=xmldoc.getElementsByTagName("item").length;


//if (bb>10){
//    bb=10;
//}
//var i
//var archivo
//var titulo

//for(i=0;i<bb;i++){
//    codigotem+="<table width=100% border=0>"

//    titulo=xmldoc.getElementsByTagName("item")[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
//    fecha=xmldoc.getElementsByTagName("item")[i].getElementsByTagName("pubDate")[0].childNodes[0].nodeValue;
//    descripcion=xmldoc.getElementsByTagName("item")[i].getElementsByTagName("description")[0].childNodes[0].nodeValue;
//    subtitulo=xmldoc.getElementsByTagName("item")[i].getElementsByTagName("subtitle")[0].childNodes[0].nodeValue;
//    imagen=xmldoc.getElementsByTagName("item")[i].getElementsByTagName("image")[0].childNodes[0].nodeValue;

//    codigotem+="<tr><td  class=cabecero>"+titulo+" ("+fecha+")</td></tr>"
//    codigotem+="<tr><td  class=subcabecero>"+subtitulo+"</td></tr>"
//    codigotem+="<tr><td class=bloque align=center><a href=index1_es.php><img src="+imagen+" width=98% height=200px border=0/></td></tr>"
//    codigotem+="<tr><td class=bloque>"+descripcion+"</td></tr>"
//    codigotem+="</table>"

//}

//console.log(codigotem);

PropiedadesUpwelling.serie1 = {
    name: 'HFNMOC 2016',
    data: [-978.573, 228.738, 386.888, -267.686, -15.522, 491.513, undefined, undefined, undefined, undefined, undefined, undefined],
    color: "blue"
}
PropiedadesUpwelling.serie2 = {
    name: 'HMeteogalicia 2015',
    data: [198.801, 841.263, 892.858, 297.484, 6.141, 1193.723, 95.628, 225.597, 389.532, -200.625, -578.589, -3488.552],
    color: "green"
}

PropiedadesUpwelling.Series = [];

function loadXMLDoc(dname) {

    if (navigator.appName == 'Microsoft Internet Explorer') {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        xhttp.open("GET", dname, false);
    } else {
        xhttp = new XMLHttpRequest();
        xhttp.open("GET", dname, false);
    }

    console.log(xhttp);

    xhttp.send();
    return xhttp.responseXML;

}

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
    "esri/layers/GraphicsLayer",
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
    GraphicsLayer, webMercatorUtils, array, domConstruct, dom, on, declare, esriConfig, parser
) {
    esriConfig.defaults.io.proxyUrl = "../proxy/proxy.php";
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

});
//#endregion


//#region Graphs
function addSerietoGraph() {
    if (existSource()) {
        //PropiedadesUpwelling.Series.push(PropiedadesUpwelling.serie1);
        require(['highcharts', 'exporting-highcharts'], function () {
            //$.ajax({
            //    type: "get",
            //    url: "http://localhost:29128/App_Data/HFNMOC_mensual.xml",
            //    dataType: "jsonp",
            //    success: function (data) {
            //        /* handle data here */
            //        console.log(data);
            //    },
            //    error: function (xhr, status) {
            //        /* handle error here */
            //        console.log(xhr);
            //        console.log(status);
            //    }
            //});

            $('#tableSourceUpwelling').show();
            (PropiedadesUpwelling.Series.length > 0) ? PropiedadesUpwelling.Series.push(PropiedadesUpwelling.serie1) : PropiedadesUpwelling.Series.push(PropiedadesUpwelling.serie2);
            prepareTable();
            addsourcetoTable();
            var UpwellingChart = $('#graphicUpwelling').highcharts({

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
                series: PropiedadesUpwelling.Series
            });

            $("#graphicUpwelling").show();
            PropiedadesUpwelling.UpwellingChart = UpwellingChart.highcharts();
        });
    }    
}

function removeSerietoGraph() {
    console.log(PropiedadesUpwelling.sourceselected, PropiedadesUpwelling.yearselected);
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

    require(['datatables', 'datatables-bootstrap', 'datatables-buttons', 'datatables-buttons-flash'], function () {
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
            buttons: [
                'copy', 'csv', 'pdf'
            ]

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