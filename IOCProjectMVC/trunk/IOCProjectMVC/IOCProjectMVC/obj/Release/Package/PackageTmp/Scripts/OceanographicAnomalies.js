var PropiedadesOceanAnomalies = new Object();
PropiedadesOceanAnomalies.VariablesGlobales = ['map', 'startExtent', 'urlwms', 'layer'];

cargarvariablesGlobales();

function cargarvariablesGlobales() {
    $.each(PropiedadesOceanAnomalies.VariablesGlobales, function (index, value) {
        PropiedadesOceanAnomalies[value] = undefined;
    });
}

//Muestro el botón de limpiar entidades
$('#ClearButton').show()

//Ajusto el tamaño del panel donde va el mapa
var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 170;
$("#mapDiv").css("min-height", (height) + "px");


//#region Action Panel
function displaypanels(idbutton) {

    switch (idbutton) {
        case 'ShowOneLayerButton':
            if ($('#' + 'OceanographicAnomalyOneLayer_Panel').css('display') == 'none') {
            } else {
                if (window.oneLayer) {
                    PropiedadesOceanAnomalies.map.removeLayer(window.oneLayer)
                }
            }
            showhidePanel('OceanographicAnomalyOneLayer_Panel');
            break;
        case 'CompareLayersButton':
            if ($('#' + 'OceanographicAnomalyTwoLayer_Panel').css('display') == 'none') {
            } else {
                if (window.compare1Layer) {
                    PropiedadesOceanAnomalies.map.removeLayer(window.compare1Layer)
                }
                if (window.compare2Layer) {
                    PropiedadesOceanAnomalies.map.removeLayer(window.compare2Layer)
                }
                if (window.legend) {
                    window.legend.destroy();
                }
                if (window.swipeWidget) {
                    window.swipeWidget.destroy();
                }
            }
            showhidePanel('OceanographicAnomalyTwoLayer_Panel');

            break;
        case 'CalculateAnomalyButton':
            showhidePanel('OceanographicAnomalyCalculate_Panel');
            break;
        case 'ShowOrtoProyectButton':
            showhidePanel('OceanographicAnomalyOrto_Panel');
            break;
    }
}

function showhidePanel(panelId) {
    ($('#' + panelId).css('display') == 'none') ? $('#' + panelId).show() : $('#' + panelId).hide();
    ShowHideActionPanel();
}

function ShowHideActionPanel() {
    ($('#OceanographicAnomalyAction_Panel').css('display') == 'none') ? $('#OceanographicAnomalyAction_Panel').show() : $('#OceanographicAnomalyAction_Panel').hide();
}

//#endregion

//Onclick handler Legend Button
function showhideLegend() {
    ($('#legendPanel').css('display') == 'none') ? $('#legendPanel').show() : $('#legendPanel').hide();
}
closeApp
$("#closeApp").on("click", function () {
    $('#showApp_Panel').hide();
});
$("#buttonShowApp").on("click", function () {
    function CreateUrl() {
        var coords = "-14.35,3.94,426";
        var url = "https://earth.nullschool.net/#current/ocean";
        
        var animated = $("#animatedSelect").val();
        if (animated == "1") {
            url += "/surface/currents"
        } else {
            url += "/primary/waves"
        }
        var control = $("#controlSelect").val();
        if (control == "2") {
            url += "/anim=off"
        }

        var overlay = $("#overlaySelect").val();
        switch (overlay) {
            case "1":
                url += "/overlay=currents";
                break;
            case "2":
                url += "/overlay=primary_waves";
                break;
            case "3":
                url += "/overlay=sea_surface_temp";
                break;
            case "4":
                url += "/overlay=sea_surface_temp_anomaly";
                break;
            case "5":
                url += "/overlay=significant_wave_height";
                break;
            case "6":
                url += "/overlay=off";
                break;
        }
        url += "/orthographic=" + coords;
        return url;
    }
    url = CreateUrl();
console.log(url)
    $("#frameApp").attr("src", url);
    // $("#dialog").append($("<iframe />").attr("src", "your link")).dialog({ dialogoptions});
    // ($('#showApp_Panel').css('display') == 'none') ? $('#showApp_Panel').show() : $('#showApp_Panel').hide();
    $('#showApp_Panel').show();
});
//#region Map
require([
    "esri/map",
    "esri/geometry/Extent",
    "esri/arcgis/utils",
    "esri/toolbars/navigation",
    "esri/dijit/HomeButton",
    "esri/dijit/Legend",
    "esri/geometry/webMercatorUtils",
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/DynamicMapServiceLayer",
    "esri/dijit/LayerSwipe",
    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/parser",
    "dojo/_base/array",
    "dojo/io-query",
    "dojo/_base/declare",
    "dijit/layout/AccordionContainer",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dojo/domReady!"
], function (Map, Extent, utils, Navigation, HomeButton, Legend, webMercatorUtils,
    ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, DynamicMapServiceLayer, LayerSwipe,
    on, dom, domConstruct, parser, arrayUtils, ioquery, declare
) {
    var legend;
    esriConfig.defaults.io.proxyUrl = "../proxy/asp/proxy.ashx";
    parser.parse();

    //Variable con la extensión inicial del mapa 
    PropiedadesOceanAnomalies.startExtent = new Extent(-50, 12, 0, 41, new esri.SpatialReference({ wkid: 4326 }));

    PropiedadesOceanAnomalies.map = new Map("mapDiv", {
        extent: PropiedadesOceanAnomalies.startExtent,
        center: [-20, 26],
        basemap: "oceans",
        logo: false
    });

    //Home Button Dijit
    PropiedadesOceanAnomalies.home = new HomeButton({
        map: PropiedadesOceanAnomalies.map
    }, "HomeButton");
    PropiedadesOceanAnomalies.home.startup();

    //#region Maxima extensión del mapa
    var navToolbar = new Navigation(PropiedadesOceanAnomalies.map);
    //Constreñimos la extensión del mapa a la inicial por medio del evento onextentchange.
    on(PropiedadesOceanAnomalies.map, "extent-change", function (extent) {
        var buffer = 20; //En mi caso 1 grado
        // set costraint extent to initExtent +buffer
        var constraintExtent = new esri.geometry.Extent(PropiedadesOceanAnomalies.startExtent.xmin - buffer, PropiedadesOceanAnomalies.startExtent.ymin - buffer, PropiedadesOceanAnomalies.startExtent.xmax + buffer, PropiedadesOceanAnomalies.startExtent.ymax + buffer);
        if (!constraintExtent.contains(extent.extent) || !constraintExtent.intersects(extent.extent)) {
            // zoom back to previous extent
            navToolbar.zoomToPrevExtent();
        }
    });

    //#region WMSlayers
    declare("my.nexradWMSLayer", DynamicMapServiceLayer, {
        constructor: function (url) {
            this.url = url;
            this.initialExtent = this.fullExtent = new Extent({
                xmin: -180,
                ymin: -90,
                xmax: 180,
                ymax: 90,
                spatialReference: {
                    wkid: 4326
                }
            });
            this.spatialReference = new esri.SpatialReference({
                wkid: 4326
            });
            this.loaded = true;
            this.onLoad(this);
        },

        getImageUrl: function (extent, width, height, callback) {
            var mp = webMercatorUtils.webMercatorToGeographic(extent);
            mp.ymin = mp.ymin + 1.5;
            var params = {
                request: "GetMap",
                transparent: true,
                format: "image/png",
                transparent: "true",
                bgcolor: "ffffff",
                version: "1.3.0",
                layers: this.url,
                styles: "default,default",
                exceptions: "application/vnd.ogc.se_xml",
                //changing values
                bbox: mp.xmin + "," + mp.ymin + "," + mp.xmax + "," + mp.ymax,
                srs: "EPSG:" + mp.spatialReference.wkid,
                width: width,
                height: height
            };

            console.log(PropiedadesOceanAnomalies.urlwms + ioquery.objectToQuery(params));
            callback(PropiedadesOceanAnomalies.urlwms + ioquery.objectToQuery(params));
        }
    });
    //#endregion


    //#region One Layer

    $("select[name='OneParameter']").on('change', parameter_selected_one);
    $("select[name='Month']").on('change', layer_selected);
    $("#SelectOneLayer").on('click', SelectOneLayer);
    $("#CompareLayers").on('click', SelectOTwoLayer);

    function parameter_selected_one() {
        //Activo el combobox de mes
        $("select[name='Month']").prop("disabled", false);

        //Desactivo el combobox de año
        $("select[name='Year']").prop("disabled", true);

        var parameter = $("select[name='OneParameter']").find("option:selected").val();
        if (parameter == "Temperature") {
            PropiedadesOceanAnomalies.urlwms = "http://gmis.jrc.ec.europa.eu/webservices/4km/wms/pathfinder?";
        }

        else if (parameter == "Chlorophyll") {
            PropiedadesOceanAnomalies.urlwms = "http://gmis.jrc.ec.europa.eu/webservices/4km/wms/modisa?";
        }
    }


    function layer_selected() {
        //Activo el combobox
        $("select[name='Year']").prop("disabled", false);

        //Borrar la lista
        var comboyear = $("select[name='Year']");
        comboyear
            .find('option')
            .remove()
            .end()
            .append('<option disabled value="">Choose a Year</option>')
            .val('')
        ;

        var parameter = $("select[name='OneParameter']").find("option:selected").val();
        console.log(parameter);
        if (parameter == "Temperature") {
            for (var i = 1982; i < 2010; i++) {
                comboyear.append('<option value="' + i + '">' + String(i) + '</option>');
            }
        }

        else if (parameter == "Chlorophyll") {
            for (var i = 2003; i < 2013; i++) {
                comboyear.append('<option value="' + i + '">' + String(i) + '</option>');
            }
        }
    }

    function SelectOneLayer() {
        require([
         "dojo/on"
        ],
       function (on) {

           var meslayer = $("select[name='Month']").find("option:selected").val();
           var añolayer = $("select[name='Year']").find("option:selected").val();
           if (meslayer.toString().length == 1) {
               meslayer = "0" + meslayer.toString();
           }


           var parameter = $("select[name='OneParameter']").find("option:selected").val();
           if (parameter == "Temperature") {
               PropiedadesOceanAnomalies.layer = "GMIS_P_SST_" + meslayer + "_" + añolayer;
           }

           else if (parameter == "Chlorophyll") {
               PropiedadesOceanAnomalies.layer = "GMIS_A_CHLA_" + meslayer + "_" + añolayer;
           }

           //console.log(layer);

           var wmsLayer = new my.nexradWMSLayer(PropiedadesOceanAnomalies.layer);

           PropiedadesOceanAnomalies.map.addLayers([wmsLayer]);
           window.oneLayer = wmsLayer;
           cargarLegendaOneLayer(meslayer, añolayer);


       });

    }

    function cargarLegendaOneLayer(meslayer, añolayer) {

        //var c = dojo.byId("Select6");
        var imglegend = dojo.byId("imaglegend1");
        //var legendDiv3 = dojo.byId("legendDiv3");
        var MetadataDiv = dojo.byId("metadataDiv");
        var legendtitle = dojo.byId("legendtitle1");
        var Units = dojo.byId("Units1");

        //var combo1 = dojo.byId("Select7");
        //var meslayer = combo1.options[combo1.selectedIndex].value;
        //var combo2 = dojo.byId("Select8");
        //var añolayer = combo2.options[combo2.selectedIndex].value;
        //var img = legendDiv
        var parameter = $("select[name='OneParameter']").find("option:selected").val();
        if (parameter == "Temperature") {
            imglegend.src = "http://gmis.jrc.ec.europa.eu/mapserver/images/legend_sst.PNG";
            document.getElementById('legendtitle1').innerHTML = 'Sea Surface Temperature PATHFINDER';
            document.getElementById('Units1').innerHTML = 'Units:           ºC';
            //document.getElementById('metadata1').innerHTML = "Sea surface temperature (SST in degree-C): Sea surface temperature is the temperature of the water close to the sea surface. SST is a standard product from satellite-based thermal infra-red sensors, and optical sensors complemented with infrared bands.";
            //document.getElementById('metadata2').innerHTML = '<b>Satellite:</b><br>Pathfinder Data Set (Jan. 1985 - Dec. 2009) - The data is a re-analysis of the NOAA/NASA Advanced Very High Resolution Radiometer (AVHRR) data stream conducted by the University of Miami' + "'s " + 'Rosenstiel School of Marine and Atmospheric Science (RSMAS) and the NOAA National Oceanographic Data Center (NODC). It consists of 4km monthly SST (in °C) extracted from the version 5.2 AVHRR Pathfinder project (' + '<a target="_blank" href="' + 'http://www.nodc.noaa.gov/SatelliteData/pathfinder4km/' + '">' + 'http://www.nodc.noaa.gov/SatelliteData/pathfinder4km/' + '</a>' + ').<br><br><b>Reference:</b><br>Casey, K.S., T.B. Brandon, P. Cornillon, and R. Evans (2010). ' + '"The Past, Present and Future of the AVHRR Pathfinder SST Program, in Oceanography from Space: Revisited", eds. V. Barale, J.F.R. Gower, and L. Alberotanza, Springer. DOI: 10.1007/978-90-481-8681-5_16.';
            document.getElementById('InfoLayer').innerHTML = "<b>Info Layer:</b><br>Month: " + meslayer + "   " + "Year: " + añolayer;
            //legendDiv3.style.display = "block";
            MetadataDiv.style.display = "block";
        }
        else {
            imglegend.src = "http://gmis.jrc.ec.europa.eu/mapserver/images/legend_Chl_a.PNG";
            document.getElementById('legendtitle1').innerHTML = 'Chlorophyll Concentration MODIS-A';
            document.getElementById('Units1').innerHTML = 'Units:           mg.m^-3';
            //document.getElementById('metadata1').innerHTML = "Algal biomass (chlorophyll concentration, Chla in mg.m-3): Chlorophyll is a photosynthetic pigment commonly present in all phytoplankton species. It is used as a proxy for phytoplankton biomass. Chlorophyll concentration is a standard product from satellite-based optical sensors, usually retrieved from empirical algorithms using reflectance ratios at two or more wavebands.";
            //document.getElementById('metadata2').innerHTML = '<b>Satellite:</b><br>MODIS-Aqua data set (Jul. 2002 - Apr. 2006) - This data set consists of 4km monthly standard 11µm Non-Linear SST (NLSST) algorithm developed by conducted by the University of Miami' + "'s " + 'Rosenstiel School of Marine and Atmospheric Science (RSMAS). This data is equivalent to the standard NASA products available from ' + '<a target="_blank" href="' + 'http://oceancolor.gsfc.nasa.gov/' + '">' + 'http://oceancolor.gsfc.nasa.gov/' + '</a>' + '<br><br><b>Reference:</b><br>Brown, O.B., and P.J. Minnett, 1999, ' + '"MODIS Infrared Sea Surface Temperature Algorithm Theoretical Basis Document", Ver 2.0, ' + '<a target="_blank" href="' + 'http://modis.gsfc.nasa.gov/data/atbd/atbd_mod25.pdf' + '">' + 'http://modis.gsfc.nasa.gov/data/atbd/atbd_mod25.pdf' + '</a>';
            document.getElementById('InfoLayer').innerHTML = "<b>Info Layer:</b><br>Month: " + meslayer + "   " + "Year: " + añolayer;
            //legendDiv3.style.display = "block";
            MetadataDiv.style.display = "block";
        }
        $("#InfoLayer").show();
        $("#LeftInfoLayer").hide();
        $("#RightInfoLayer").hide();

    }


    //#endregion

    //#region swipe
    $("select[name='CompareParameter']").on('change', layer_selectedCompare);

    function layer_selectedCompare() {
        //Activo el combobox
        $("select[name='Yearone']").prop("disabled", false);
        $("select[name='Yeartwo']").prop("disabled", false);

        //Borrar la lista
        var comboyear = $("select[name='Yearone']");
        comboyear
            .find('option')
            .remove()
            .end()
            .append('<option disabled value="">Choose a Year</option>')
            .val('')
        ;
        var comboyear2 = $("select[name='Yeartwo']");
        comboyear2
            .find('option')
            .remove()
            .end()
            .append('<option disabled value="">Choose a Year</option>')
            .val('')
        ;

        var parameter = $("select[name='CompareParameter']").find("option:selected").val();
        if (parameter == "Temperature") {
            PropiedadesOceanAnomalies.urlwms = "http://gmis.jrc.ec.europa.eu/webservices/4km/wms/pathfinder?";
        }

        else if (parameter == "Chlorophyll") {
            PropiedadesOceanAnomalies.urlwms = "http://gmis.jrc.ec.europa.eu/webservices/4km/wms/modisa?";
        }
        var parameter = $("select[name='CompareParameter']").find("option:selected").val();
        console.log(parameter);
        if (parameter == "Temperature") {
            for (var i = 1982; i < 2010; i++) {
                comboyear.append('<option value="' + i + '">' + String(i) + '</option>');
                comboyear2.append('<option value="' + i + '">' + String(i) + '</option>');
            }
        }

        else if (parameter == "Chlorophyll") {
            for (var i = 2003; i < 2013; i++) {
                comboyear.append('<option value="' + i + '">' + String(i) + '</option>');
                comboyear2.append('<option value="' + i + '">' + String(i) + '</option>');
            }
        }
    }

    function SelectOTwoLayer() {
        require([
                  "dojo/on"
        ],
                function (on) {
                    //if (dojo.byId("PanelSelect").style.display == "none") {
                    //    dojo.byId("PanelSelect").style.display = "block";
                    //}

                    //else {
                    //    dojo.byId("PanelSelect").style.display = "none";
                    //}

                    //if (dojo.byId("NewSelect").style.display == "none") {
                    //    dojo.byId("NewSelect").style.display = "block";
                    //}

                    //else {
                    //    dojo.byId("NewSelect").style.display = "none";
                    //}

                    //Abro el Informpanel para mostrar que está cargando
                    // console.log(timerID = setTimeout("fTimer()", 500));
                    //timerID = setTimeout("fTimer()", 500);

                    var meslayer1 = $("select[name='Monthone']").find("option:selected").val();
                    var añolayer1 = $("select[name='Yearone']").find("option:selected").val();

                    var meslayer2 = $("select[name='Monthtwo']").find("option:selected").val();
                    var añolayer2 = $("select[name='Yeartwo']").find("option:selected").val();



                    if (meslayer1.toString().length == 1) {
                        meslayer1 = "0" + meslayer1.toString();
                    }
                    if (meslayer2.toString().length == 1) {
                        meslayer2 = "0" + meslayer2.toString();
                    }

                    var parameter = $("select[name='CompareParameter']").find("option:selected").val();
                    if (parameter == "Temperature") {
                        PropiedadesOceanAnomalies.layerOne = "GMIS_P_SST_" + meslayer1 + "_" + añolayer1;
                        PropiedadesOceanAnomalies.layerTwo = "GMIS_P_SST_" + meslayer2 + "_" + añolayer2;
                    }

                    else if (parameter == "Chlorophyll") {
                        PropiedadesOceanAnomalies.layerOne = "GMIS_A_CHLA_" + meslayer1 + "_" + añolayer1;
                        PropiedadesOceanAnomalies.layerTwo = "GMIS_A_CHLA_" + meslayer2 + "_" + añolayer2;
                    }



                    console.log(PropiedadesOceanAnomalies.layerOne, PropiedadesOceanAnomalies.layerTwo);

                    var wmsLayer1 = new my.nexradWMSLayer(PropiedadesOceanAnomalies.layerOne);

                    var wmsLayer2 = new my.nexradWMSLayer(PropiedadesOceanAnomalies.layerTwo);

                    //map.addLayer(wmsLayer1);
                    //map.addLayer(wmsLayer2);
                    if (window.compare1Layer) {
                        PropiedadesOceanAnomalies.map.removeLayer(window.compare1Layer);
                        PropiedadesOceanAnomalies.map.removeLayer(window.compare2Layer);
                    }
                    PropiedadesOceanAnomalies.map.addLayers([wmsLayer1, wmsLayer2]);
                    window.compare1Layer = wmsLayer1;
                    window.compare2Layer = wmsLayer2;

                    //console.log(closeinformpanel());

                    cargarLegendaTwoLayer(meslayer1, meslayer2, añolayer1, añolayer2);


                });
    }

    function cargarLegendaTwoLayer(meslayer1, meslayer2, añolayer1, añolayer2) {


        //var c = dojo.byId("Select6");
        var imglegend = dojo.byId("imaglegend1");
        //var legendDiv3 = dojo.byId("legendDiv3");
        var MetadataDiv = dojo.byId("metadataDiv");
        var legendtitle = dojo.byId("legendtitle1");
        var Units = dojo.byId("Units1");

        //var combo1 = dojo.byId("Select7");
        //var meslayer = combo1.options[combo1.selectedIndex].value;
        //var combo2 = dojo.byId("Select8");
        //var añolayer = combo2.options[combo2.selectedIndex].value;
        //var img = legendDiv
        var parameter = $("select[name='CompareParameter']").find("option:selected").val();
        if (parameter == "Temperature") {
            imglegend.src = "http://gmis.jrc.ec.europa.eu/mapserver/images/legend_sst.PNG";
            document.getElementById('legendtitle1').innerHTML = 'Sea Surface Temperature PATHFINDER';
            document.getElementById('Units1').innerHTML = 'Units:           ºC';
            //document.getElementById('metadata1').innerHTML = "Sea surface temperature (SST in degree-C): Sea surface temperature is the temperature of the water close to the sea surface. SST is a standard product from satellite-based thermal infra-red sensors, and optical sensors complemented with infrared bands.";
            //document.getElementById('metadata2').innerHTML = '<b>Satellite:</b><br>Pathfinder Data Set (Jan. 1985 - Dec. 2009) - The data is a re-analysis of the NOAA/NASA Advanced Very High Resolution Radiometer (AVHRR) data stream conducted by the University of Miami' + "'s " + 'Rosenstiel School of Marine and Atmospheric Science (RSMAS) and the NOAA National Oceanographic Data Center (NODC). It consists of 4km monthly SST (in °C) extracted from the version 5.2 AVHRR Pathfinder project (' + '<a target="_blank" href="' + 'http://www.nodc.noaa.gov/SatelliteData/pathfinder4km/' + '">' + 'http://www.nodc.noaa.gov/SatelliteData/pathfinder4km/' + '</a>' + ').<br><br><b>Reference:</b><br>Casey, K.S., T.B. Brandon, P. Cornillon, and R. Evans (2010). ' + '"The Past, Present and Future of the AVHRR Pathfinder SST Program, in Oceanography from Space: Revisited", eds. V. Barale, J.F.R. Gower, and L. Alberotanza, Springer. DOI: 10.1007/978-90-481-8681-5_16.';
            document.getElementById('LeftInfoLayer').innerHTML = "<b>Left Layer:</b><br>Month: " + meslayer2 + "Year: " + añolayer2;
            document.getElementById('RightInfoLayer').innerHTML = "<b>Right Layer:</b><br>Month: " + meslayer1 + "Year: " + añolayer1;
            //legendDiv3.style.display = "block";
            MetadataDiv.style.display = "block";
        }
        else {
            imglegend.src = "http://gmis.jrc.ec.europa.eu/mapserver/images/legend_Chl_a.PNG";
            document.getElementById('legendtitle1').innerHTML = 'Chlorophyll Concentration MODIS-A';
            document.getElementById('Units1').innerHTML = 'Units:           mg.m^-3';
            //document.getElementById('metadata1').innerHTML = "Algal biomass (chlorophyll concentration, Chla in mg.m-3): Chlorophyll is a photosynthetic pigment commonly present in all phytoplankton species. It is used as a proxy for phytoplankton biomass. Chlorophyll concentration is a standard product from satellite-based optical sensors, usually retrieved from empirical algorithms using reflectance ratios at two or more wavebands.";
            //document.getElementById('metadata2').innerHTML = '<b>Satellite:</b><br>MODIS-Aqua data set (Jul. 2002 - Apr. 2006) - This data set consists of 4km monthly standard 11µm Non-Linear SST (NLSST) algorithm developed by conducted by the University of Miami' + "'s " + 'Rosenstiel School of Marine and Atmospheric Science (RSMAS). This data is equivalent to the standard NASA products available from ' + '<a target="_blank" href="' + 'http://oceancolor.gsfc.nasa.gov/' + '">' + 'http://oceancolor.gsfc.nasa.gov/' + '</a>' + '<br><br><b>Reference:</b><br>Brown, O.B., and P.J. Minnett, 1999, ' + '"MODIS Infrared Sea Surface Temperature Algorithm Theoretical Basis Document", Ver 2.0, ' + '<a target="_blank" href="' + 'http://modis.gsfc.nasa.gov/data/atbd/atbd_mod25.pdf' + '">' + 'http://modis.gsfc.nasa.gov/data/atbd/atbd_mod25.pdf' + '</a>';
            document.getElementById('LeftInfoLayer').innerHTML = "<b>Left Layer:</b><br>Month: " + meslayer2 + "   " + "Year: " + añolayer2;
            document.getElementById('RightInfoLayer').innerHTML = "<b>Right Layer:</b><br>Month: " + meslayer1 + "   " + "Year: " + añolayer1;
            // legendDiv3.style.display = "block";
            MetadataDiv.style.display = "block";
        }
        $("#InfoLayer").hide();
        $("#LeftInfoLayer").show();
        $("#RightInfoLayer").show();

        //var c = dojo.byId("Select5");
        //var imglegend = dojo.byId("imaglegend");
        //var legendDiv2 = dojo.byId("legendDiv2");
        //var MetadataDiv = dojo.byId("MetadataDiv");
        //var legendtitle = dojo.byId("legendtitle");
        //var Units = dojo.byId("Units");

        //var combo1 = dojo.byId("Select1");
        //var meslayer1 = combo1.options[combo1.selectedIndex].value;
        //var combo2 = dojo.byId("Select2");
        //var añolayer1 = combo2.options[combo2.selectedIndex].value;

        //var combo3 = dojo.byId("Select3");
        //var meslayer2 = combo3.options[combo3.selectedIndex].value;
        //var combo4 = dojo.byId("Select4");
        //var añolayer2 = combo4.options[combo4.selectedIndex].value;

        //if (c.options[c.selectedIndex].value == 1) {
        //    imglegend.src = "http://gmis.jrc.ec.europa.eu/mapserver/images/legend_sst.PNG";
        //    document.getElementById('legendtitle').innerHTML = 'Sea Surface Temperature PATHFINDER';
        //    document.getElementById('Units').innerHTML = 'Units:           ºC';
        //    document.getElementById('metadata1').innerHTML = "Sea surface temperature (SST in degree-C): Sea surface temperature is the temperature of the water close to the sea surface. SST is a standard product from satellite-based thermal infra-red sensors, and optical sensors complemented with infrared bands.";
        //    document.getElementById('metadata2').innerHTML = '<b>Satellite:</b><br>Pathfinder Data Set (Jan. 1985 - Dec. 2009) - The data is a re-analysis of the NOAA/NASA Advanced Very High Resolution Radiometer (AVHRR) data stream conducted by the University of Miami' + "'s " + 'Rosenstiel School of Marine and Atmospheric Science (RSMAS) and the NOAA National Oceanographic Data Center (NODC). It consists of 4km monthly SST (in °C) extracted from the version 5.2 AVHRR Pathfinder project (' + '<a target="_blank" href="' + 'http://www.nodc.noaa.gov/SatelliteData/pathfinder4km/' + '">' + 'http://www.nodc.noaa.gov/SatelliteData/pathfinder4km/' + '</a>' + ').<br><br><b>Reference:</b><br>Casey, K.S., T.B. Brandon, P. Cornillon, and R. Evans (2010). ' + '"The Past, Present and Future of the AVHRR Pathfinder SST Program, in Oceanography from Space: Revisited", eds. V. Barale, J.F.R. Gower, and L. Alberotanza, Springer. DOI: 10.1007/978-90-481-8681-5_16.';
        //    document.getElementById('LeftInfoLayer').innerHTML = "<b>Left Layer:</b><br>Month: " + meslayer2 + "Year: " + añolayer2;
        //    document.getElementById('RightInfoLayer').innerHTML = "<b>Right Layer:</b><br>Month: " + meslayer1 + "Year: " + añolayer1;
        //    legendDiv2.style.display = "block";
        //    MetadataDiv.style.display = "block";
        //}

        //else if (c.options[c.selectedIndex].value == 2) {
        //    imglegend.src = "http://gmis.jrc.ec.europa.eu/mapserver/images/legend_Chl_a.PNG";
        //    document.getElementById('legendtitle').innerHTML = 'Chlorophyll Concentration MODIS-A';
        //    document.getElementById('Units').innerHTML = 'Units:           mg.m^-3';
        //    document.getElementById('metadata1').innerHTML = "Algal biomass (chlorophyll concentration, Chla in mg.m-3): Chlorophyll is a photosynthetic pigment commonly present in all phytoplankton species. It is used as a proxy for phytoplankton biomass. Chlorophyll concentration is a standard product from satellite-based optical sensors, usually retrieved from empirical algorithms using reflectance ratios at two or more wavebands.";
        //    document.getElementById('metadata2').innerHTML = '<b>Satellite:</b><br>MODIS-Aqua data set (Jul. 2002 - Apr. 2006) - This data set consists of 4km monthly standard 11µm Non-Linear SST (NLSST) algorithm developed by conducted by the University of Miami' + "'s " + 'Rosenstiel School of Marine and Atmospheric Science (RSMAS). This data is equivalent to the standard NASA products available from ' + '<a target="_blank" href="' + 'http://oceancolor.gsfc.nasa.gov/' + '">' + 'http://oceancolor.gsfc.nasa.gov/' + '</a>' + '<br><br><b>Reference:</b><br>Brown, O.B., and P.J. Minnett, 1999, ' + '"MODIS Infrared Sea Surface Temperature Algorithm Theoretical Basis Document", Ver 2.0, ' + '<a target="_blank" href="' + 'http://modis.gsfc.nasa.gov/data/atbd/atbd_mod25.pdf' + '">' + 'http://modis.gsfc.nasa.gov/data/atbd/atbd_mod25.pdf' + '</a>';
        //    document.getElementById('LeftInfoLayer').innerHTML = "<b>Left Layer:</b><br>Month: " + meslayer2 + "   " + "Year: " + añolayer2;
        //    document.getElementById('RightInfoLayer').innerHTML = "<b>Right Layer:</b><br>Month: " + meslayer1 + "   " + "Year: " + añolayer1;
        //    legendDiv2.style.display = "block";
        //    MetadataDiv.style.display = "block";
        //}

        var layerIni;
        var legendLayers = [];
        var primera = false;
        if (legend) {
            primera = true;
        }

        //for (var j = 1; j < PropiedadesOceanAnomalies.map.layerIds.length; j++) {
        //    var capa = PropiedadesOceanAnomalies.map.getLayer(PropiedadesOceanAnomalies.map.layerIds[j]);
        //    if (layerIni == null)
        //        layerIni = capa;
        //    legendLayers.push({ layer: capa, title: capa.id });
        //}

        //if (!primera) {
        //    //legend = new esri.dijit.Legend({
        //    //    map: PropiedadesOceanAnomalies.map,
        //    //    layerInfos: legendLayers,
        //    //    autoUpdate: true
        //    //}, "legendDiv");
        //    //legend.startup();
        //}

        //else {
        //  //  legend.layerInfos = legendLayers;
        //    //legend.refresh();
        //   // dojo.byId("swipeDiv").style.display = "block";
        //}
        // window.legend = legend;


        var arraylayers = PropiedadesOceanAnomalies.map.layerIds;
        var layerswipe = arraylayers[2].toString();

        if (window.swipeWidget) {
            window.swipeWidget.destroy();
        }
        $("#mapDiv").prepend("<div id='swipeDiv'></div>");

        swipeWidget = new esri.dijit.LayerSwipe({
            type: "vertical",  //Try switching to "scope" or "horizontal"
            map: PropiedadesOceanAnomalies.map,
            layers: [layerswipe]
        }, "swipeDiv");
        swipeWidget.startup();



        //else {
        //        swipeWidget.layers = [layerswipe];
        //}
        window.swipeWidget = swipeWidget;

    }

});
