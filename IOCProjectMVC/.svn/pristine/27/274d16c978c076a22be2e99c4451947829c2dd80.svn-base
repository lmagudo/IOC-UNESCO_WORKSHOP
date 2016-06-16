
var PropiedadesMapa = new Object();
PropiedadesMapa.VariablesGlobales = ['map', 'startExtent', 'legend', 'home', 'basemapGallery', 'toggle', 'layersIds',
    'overviewMapDijit', 'legendLayers', 'mygraphiclayer', 'LME', 'value_layer', 'value_param', 'value_param', 'value_year', 'value_month'];

cargarvariablesGlobales();

function cargarvariablesGlobales() {
    $.each(PropiedadesMapa.VariablesGlobales, function (index, value) {
        PropiedadesMapa[value] = undefined;
    });
}
PropiedadesMapa.LayersToClear = ["csvLayer"]

require([
    "esri/urlUtils",
      "esri/map",
      "esri/toolbars/navigation",
      "esri/dijit/HomeButton",
      "esri/dijit/BasemapToggle",
      "esri/dijit/OverviewMap",
      "esri/dijit/Legend",
      "esri/geometry/Extent",
      "esri/layers/ArcGISTiledMapServiceLayer",
      "esri/layers/ArcGISDynamicMapServiceLayer",
      "esri/layers/DynamicMapServiceLayer",
      "esri/layers/GraphicsLayer",
      "esri/layers/WMSLayerInfo",
      "esri/layers/WMSLayer",
      "esri/tasks/FindTask",
      "esri/tasks/FindParameters",
      "esri/dijit/PopupMobile",
      "esri/geometry/webMercatorUtils",
      "dijit/form/CheckBox",
      "dojo/_base/array",
      "dojo/dom-construct",
      "dojo/dom",
      "dojo/on",
      "dojo/query",
      "dojo/io-query",
      "dojo/_base/declare",
      "esri/config",
      "dojo/parser",
      "dojo/domReady!"
], function (urlUtils, Map, Navigation, HomeButton, BasemapToggle, OverviewMap, Legend, Extent,
    ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, DynamicMapServiceLayer, GraphicsLayer, WMSLayerInfo, WMSLayer,
    FindTask, FindParameters, PopupMobile, webMercatorUtils, CheckBox, array, domConstruct, dom, on, query, ioquery, declare, esriConfig, parser
) {
    //Ajusto el tamaño del div donde va el mapa
    var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 60;
    $("#mapDiv").css("min-height", (height) + "px");

    //Codigo para activar la utilización de la página proxy
    esriConfig.defaults.io.proxyUrl = "../proxy/proxy.php";

    //esriConfig.defaults.io.proxyUrl = "../PHP/proxy.php";

    //urlUtils.addProxyRule({
    //    urlPrefix: "http://barreto.md.ieo.es/arcgis/rest/services/UNESCO",
    //    proxyUrl: "http://www.lmagudo.com/IOC/PHP/proxy.php"
    //});
    parser.parse();

    //#region Map

    //Variable que contiene mi popup
    mipopup = new PopupMobile({ marginTop: 5000 }, domConstruct.create("div"));

    //Variable con la extensión inicial del mapa 
    PropiedadesMapa.startExtent = new Extent(-50, 12, 0, 41, new esri.SpatialReference({ wkid: 4326 }));

    PropiedadesMapa.map = new Map("mapDiv", {
        extent: PropiedadesMapa.startExtent,
        center: [-20, 26],
        basemap: "oceans",
        logo: false,
        infoWindow: mipopup
    });

    //#endregion

    //#region Maxima extensión del mapa
    var navToolbar = new Navigation(PropiedadesMapa.map);
    //Constreñimos la extensión del mapa a la inicial por medio del evento onextentchange.
    on(PropiedadesMapa.map, "extent-change", function (extent) {
        var buffer = 20; //En mi caso 1 grado
        // set costraint extent to initExtent +buffer
        var constraintExtent = new esri.geometry.Extent(PropiedadesMapa.startExtent.xmin - buffer, PropiedadesMapa.startExtent.ymin - buffer, PropiedadesMapa.startExtent.xmax + buffer, PropiedadesMapa.startExtent.ymax + buffer);
        if (!constraintExtent.contains(extent.extent) || !constraintExtent.intersects(extent.extent)) {
            // zoom back to previous extent
            navToolbar.zoomToPrevExtent();
        }
    });
    //#endregion

    //#region Widgets mapa

    //Home Button Dijit
    PropiedadesMapa.home = new HomeButton({
        map: PropiedadesMapa.map
    }, "HomeButton");
    PropiedadesMapa.home.startup();

    //Overview Dijit
    PropiedadesMapa.overviewMapDijit = new OverviewMap({
        map: PropiedadesMapa.map,
        visible: false
    });

    PropiedadesMapa.overviewMapDijit.startup();

    //BaseMap Toggle Dijit
    var toggle = new BasemapToggle({
        map: PropiedadesMapa.map,
        basemap: "satellite"
    }, "BasemapToggle");
    toggle.startup();

    //#endregion

    //#region Show Coordinates
    PropiedadesMapa.map.on("load", function () {
        //after map loads, connect to listen to mouse move & drag events
        PropiedadesMapa.map.on("mouse-move", showCoordinates);
        PropiedadesMapa.map.on("mouse-drag", showCoordinates);
    });

    function showCoordinates(evt) {
        //the map is in web mercator but display coordinates in geographic (lat, long)
        var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);

        var long;
        var lat;

        if (mp.x < 0) {
            long = "W";
        }
        else {
            long = "E";
        }

        if (mp.y < 0) {
            lat = "S";
        }
        else {
            lat = "N";
        }

        //display mouse coordinates
        dom.byId("infocoord").innerHTML = Math.abs(mp.x.toFixed(3)) + "º " + long + ", " + Math.abs(mp.y.toFixed(3)) + "º " + lat;

    }

    //#endregion

    //#region Layers
    
    LME = new ArcGISDynamicMapServiceLayer("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/LME_Reg/MapServer", {
        opacity: 0.3,
        id: "LME"
    });

    LME.setVisibleLayers([0]);


    PropiedadesMapa.mygraphiclayer = new GraphicsLayer(), {
        id: "mygraphiclayer"
    }


    PropiedadesMapa.layersIds = [{"Name":"Marine Ecoregions","id":"LME"}];

    //#endregion

    //#region Legend
    PropiedadesMapa.legendLayers = [];
    //PropiedadesMapa.legendLayers.push({ layer: mangroves, title: "Mangroves" });
    //PropiedadesMapa.legendLayers.push({ layer: coldcoral, title: "Cold Coral" });        
    //PropiedadesMapa.legendLayers.push({ layer: marineEcoregions, title: "Marine Ecoregions" });
    //PropiedadesMapa.legendLayers.push({ layer: pelagicProvinces, title: "Pelagic Provinces" });
    PropiedadesMapa.legendLayers.push({ layer: LME, title: "Large Marine Ecosystems" });
    PropiedadesMapa.legendLayers.push({ layer: PropiedadesMapa.mygraphiclayer, title: "Query Layer" });


    //add the legend
    PropiedadesMapa.legend = new Legend({
        map: PropiedadesMapa.map,
        layerInfos: PropiedadesMapa.legendLayers
    }, "legendDiv");
    PropiedadesMapa.legend.startup();
    //#endregion


    PropiedadesMapa.map.addLayers([LME, PropiedadesMapa.mygraphiclayer]);

    //Fill the layers panel checks
    var htmlcheckbox = "";
    $.each(PropiedadesMapa.layersIds, function (index, value) {
        var layer = PropiedadesMapa.map.getLayer(value.id);
        var checkedbox;
        (layer.visible) ? checkedbox = "checked" : "";
        $("#layersDiv").append('<div class="checkbox"><label><input id="' + value.id + '" value="' + value.id + '" type="checkbox" onchange="updateLayerVisibility(this.id)" ' + checkedbox + '>' + value.Name + '</label></div>');        
    });
});

//Onclick handler Legend Button
function showhideLegend() {
    ($('#legendPanel').css('display') == 'none') ? $('#legendPanel').show() : $('#legendPanel').hide();
}

function showhidePanel(panelId) {
    ($('#' + panelId).css('display') == 'none') ? $('#' + panelId).show() : $('#' + panelId).hide();
}

//Show and hide layers with the checkbox
function updateLayerVisibility(evt) {
    var clayer = PropiedadesMapa.map.getLayer(evt);
    clayer.setVisibility(!clayer.visible);
    this.checked = clayer.visible;
}