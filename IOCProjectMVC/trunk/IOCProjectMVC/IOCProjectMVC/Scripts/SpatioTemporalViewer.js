﻿var PropiedadesSpatioTemporal = new Object();
PropiedadesSpatioTemporal.VariablesGlobales = ['map', 'startExtent'];

cargarvariablesGlobales();

function cargarvariablesGlobales() {
    $.each(PropiedadesSpatioTemporal.VariablesGlobales, function (index, value) {
        PropiedadesSpatioTemporal[value] = undefined;
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
    esriConfig.defaults.io.proxyUrl = "../proxy/asp/proxy.ashx";
    parser.parse();

    //Variable con la extensión inicial del mapa 
    PropiedadesSpatioTemporal.startExtent = new Extent(-50, 12, 0, 41, new esri.SpatialReference({ wkid: 4326 }));

    PropiedadesSpatioTemporal.map = new Map("mapDiv", {
        extent: PropiedadesSpatioTemporal.startExtent,
        center: [-20, 26],
        basemap: "oceans",
        logo: false
    });

    //#region Maxima extensión del mapa
    var navToolbar = new Navigation(PropiedadesSpatioTemporal.map);
    //Constreñimos la extensión del mapa a la inicial por medio del evento onextentchange.
    on(PropiedadesSpatioTemporal.map, "extent-change", function (extent) {
        var buffer = 20; //En mi caso 1 grado
        // set costraint extent to initExtent +buffer
        var constraintExtent = new esri.geometry.Extent(PropiedadesSpatioTemporal.startExtent.xmin - buffer, PropiedadesSpatioTemporal.startExtent.ymin - buffer, PropiedadesSpatioTemporal.startExtent.xmax + buffer, PropiedadesSpatioTemporal.startExtent.ymax + buffer);
        if (!constraintExtent.contains(extent.extent) || !constraintExtent.intersects(extent.extent)) {
            // zoom back to previous extent
            navToolbar.zoomToPrevExtent();
        }
    });
    //#endregion

});
//#endregion