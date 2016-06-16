﻿dojoConfig = {
    has: {
        "dojo-firebug": true
    },
    packages: [
        { name: "datatables", location: "../bower_components/datatables/media/js/jquery.dataTables.min.js", main: "jquery.dataTables.min" }
    ],

    parseOnLoad: false,
    foo: "bar",
    async: false, aliases: [
        ['$', '~/bower_components/jquery/dist/jquery.min.js']
    ]
};

var PropiedadesArgo3D = new Object();
PropiedadesArgo3D.VariablesGlobales = ['map', 'startExtent'];

cargarvariablesGlobales();

function cargarvariablesGlobales() {
    $.each(PropiedadesArgo3D.VariablesGlobales, function (index, value) {
        PropiedadesArgo3D[value] = undefined;
    });
}

//Ajusto el tamaño del panel donde va el mapa
var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 170;
$("#mapDiv").css("min-height", (height) + "px");

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
    PropiedadesArgo3D.startExtent = new Extent(-50, 12, 0, 41, new esri.SpatialReference({ wkid: 4326 }));

    PropiedadesArgo3D.map = new Map("mapDiv", {
        extent: PropiedadesArgo3D.startExtent,
        center: [-20, 26],
        basemap: "oceans",
        logo: false
    });

    //#region Maxima extensión del mapa
    var navToolbar = new Navigation(PropiedadesArgo3D.map);
    //Constreñimos la extensión del mapa a la inicial por medio del evento onextentchange.
    on(PropiedadesArgo3D.map, "extent-change", function (extent) {
        var buffer = 20; //En mi caso 1 grado
        // set costraint extent to initExtent +buffer
        var constraintExtent = new esri.geometry.Extent(PropiedadesArgo3D.startExtent.xmin - buffer, PropiedadesArgo3D.startExtent.ymin - buffer, PropiedadesArgo3D.startExtent.xmax + buffer, PropiedadesArgo3D.startExtent.ymax + buffer);
        if (!constraintExtent.contains(extent.extent) || !constraintExtent.intersects(extent.extent)) {
            // zoom back to previous extent
            navToolbar.zoomToPrevExtent();
        }
    });
    //#endregion

});
//#endregion