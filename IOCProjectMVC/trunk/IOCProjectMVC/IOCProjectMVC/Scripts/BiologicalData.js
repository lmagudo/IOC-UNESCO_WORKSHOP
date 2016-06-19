﻿var PropiedadesBiological = new Object();
PropiedadesBiological.VariablesGlobales = ['map', 'startExtent', 'tb', 'sourceSelected', 'kindongSelected', 'namespeciesSelected','numberChart'];

cargarvariablesGlobales();

function cargarvariablesGlobales() {
    $.each(PropiedadesBiological.VariablesGlobales, function (index, value) {
        PropiedadesBiological[value] = undefined;
    });
}

PropiedadesBiological.numberChart = 0;

//Muestro el botón de limpiar entidades
$('#ClearButton').show()

//Ajusto el tamaño del panel donde va el mapa
var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 170;
$("#mapDiv").css("min-height", (height) + "px");



//#region Map
require([
    "esri/urlUtils",
    "esri/map",
    "esri/toolbars/navigation",
    "esri/dijit/HomeButton",
    "esri/dijit/BasemapToggle",
    "esri/dijit/OverviewMap",
    "esri/dijit/Legend",
    "esri/dijit/PopupMobile",
    "esri/geometry/Extent",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/geometry/webMercatorUtils",
    "esri/toolbars/draw",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojo/dom",
    "dojo/on",
    "dojo/_base/declare",
    "esri/config",
    "dojo/parser",
    "dojo/domReady!"
], function (urlUtils, Map, Navigation, HomeButton, BasemapToggle, OverviewMap, Legend, PopupMobile, Extent,
    FeatureLayer, GraphicsLayer, webMercatorUtils, Draw, Query, QueryTask,
    array, domConstruct, dom, on, declare, esriConfig, parser
) {
    esriConfig.defaults.io.proxyUrl = "../proxy/asp/proxy.ashx";
    parser.parse();

    //Variable con la extensión inicial del mapa 
    PropiedadesBiological.startExtent = new Extent(-50, 12, 0, 41, new esri.SpatialReference({ wkid: 4326 }));

    //PropiedadesBiological.popup = new PopupMobile(null, dojo.create("div"));
    PropiedadesBiological.popup = new PopupMobile({ marginTop: 5000 }, domConstruct.create("div"));

    PropiedadesBiological.map = new Map("mapDiv", {
        extent: PropiedadesBiological.startExtent,
        center: [-20, 26],
        basemap: "oceans",
        logo: false,
        infoWindow: PropiedadesBiological.popup
    });

    //Home Button Dijit
    PropiedadesBiological.home = new HomeButton({
        map: PropiedadesBiological.map
    }, "HomeButton");
    PropiedadesBiological.home.startup();

    //#region Maxima extensión del mapa
    var navToolbar = new Navigation(PropiedadesBiological.map);
    //Constreñimos la extensión del mapa a la inicial por medio del evento onextentchange.
    on(PropiedadesBiological.map, "extent-change", function (extent) {
        var buffer = 20; //En mi caso 1 grado
        // set costraint extent to initExtent +buffer
        var constraintExtent = new esri.geometry.Extent(PropiedadesBiological.startExtent.xmin - buffer, PropiedadesBiological.startExtent.ymin - buffer, PropiedadesBiological.startExtent.xmax + buffer, PropiedadesBiological.startExtent.ymax + buffer);
        if (!constraintExtent.contains(extent.extent) || !constraintExtent.intersects(extent.extent)) {
            // zoom back to previous extent
            navToolbar.zoomToPrevExtent();
        }
    });

    //#region layers

    
    PropiedadesBiological.OBISLayer = new FeatureLayer("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/OBIS_BioData/MapServer/0", {
        id: "OBIS",
        mode: FeatureLayer.MODE_SELECTION,
        outFields: ["id", "sname", "datecollected", "depth", "temperature", "salinity", "nitrate", "oxygen", "phosphate", "Kingdom"],
        visible: true
    });

    
    PropiedadesBiological.IEOLayer = new FeatureLayer("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/IEO_Lances/MapServer/0", {
        id: "IEO",
        mode: FeatureLayer.MODE_SELECTION,
        outFields: ["BIOMASA", "ABUNDANCIA", "LANPOSLON", "LANPOSLAT", "SEROBSMARACRONIMO", "ESPDESTAX", "ALFA3"],
        infoTemplate: PropiedadesBiological.IeoPopupInfoTemplate,
        visible: true
    });

    PropiedadesBiological.map.addLayers([PropiedadesBiological.OBISLayer, PropiedadesBiological.IEOLayer]);
    //#endregion

    //#region Combos

    //rellenamos el combo Kingdom
    fillComboKingdom();
    //rellenamos el combo Especies
    fillComboSpecie();
    //rellenamos el combo Campañas IEO
    fillIEOSurveys();
    //rellenamos el compo Especies IEO
    fillIEOSpecie();
    
    //Evento cambio valor en combo Source
    $("select[name='Source']").on('change', function () {
        var SourceSelected = $(this).find("option:selected").val();

        switch (SourceSelected) {
            case "OBIS":
                $("select[name='Kingdom']").prop("disabled", false);
                $("select[name='Namespecies']").prop("disabled", false);
                $("select[name='SurveyIEO']").prop("disabled", true);
                $("select[name='NamespeciesIEO']").prop("disabled", true);
                break;
            case "IEO":
                $("select[name='Kingdom']").prop("disabled", true);
                $("select[name='Namespecies']").prop("disabled", true);
                $("select[name='SurveyIEO']").prop("disabled", false);
                $("select[name='NamespeciesIEO']").prop("disabled", false);
                break;
            case "BOTH":
                $("select[name='Kingdom']").prop("disabled", false);
                $("select[name='Namespecies']").prop("disabled", false);
                $("select[name='SurveyIEO']").prop("disabled", false);
                $("select[name='NamespeciesIEO']").prop("disabled", false);
                break;
            default:
                $("select[name='Kingdom']").prop("disabled", true);
                $("select[name='Namespecies']").prop("disabled", true);
                $("#SelectBioButton").prop("disabled", true);
                $("#PolygonDrawButton").prop("disabled", true);
                break;
        }
        $("#SelectBioButton").prop("disabled", false);
        $("#PolygonDrawButton").prop("disabled", false);
        $("#BufferDrawButton").prop("disabled", false);

    });

    //Evento cambio valor en combo Kingdom
    $("select[name='Kingdom']").on('change', function () {
        fillComboSpecie();
    });

    //Evento cambio valor en combo SurveyIEO
    $("select[name='SurveyIEO']").on('change', function () {
        fillIEOSpecie();
    });

    //Función que rellena el combo Kingdom
    function fillComboKingdom() {       
        var queryTask = new QueryTask("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/OBIS_BioData/MapServer/0");
        var querykingdom = new Query();
        querykingdom.returnGeometry = false;
        querykingdom.returnDistinctValues = true;
        querykingdom.outFields = ["Kingdom"];
        querykingdom.where = "1=1"
        queryTask.execute(querykingdom, function GetResults(result) {
            var combokingdom = $("select[name='Kingdom']");
            var arraykingdoms = [];
            $.each(result.features, function (index, value) {
                arraykingdoms.push(value.attributes.Kingdom);
            });
            arraykingdoms.sort();
            $.each(arraykingdoms, function (index, value) {
                combokingdom.append('<option value="' + value + '">' + value + '</option>');
            })
        });
    }

    function fillComboSpecie() {
        var kingdomselected,
            queryTask,
            queryspecie;
        kingdomselected = $("select[name='Kingdom']").find("option:selected").val();
        queryTask = new QueryTask("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/OBIS_BioData/MapServer/0");
        queryspecie = new Query();
        queryspecie.returnGeometry = false;
        queryspecie.returnDistinctValues = true;
        queryspecie.outFields = ["tname"];
        (kingdomselected == "") ? queryspecie.where = "1=1" : queryspecie.where = "Kingdom = '" + kingdomselected + "'";
        queryTask.execute(queryspecie, function GetResults(result) {
            var combospecie = $("select[name='Namespecies']");
            combospecie.empty();
            combospecie.append('<option value=""selected disabled>Select a specie</option>');
            var arrayespecies = [];
            $.each(result.features, function (index, value) {
                arrayespecies.push(value.attributes.tname);
            });
            arrayespecies.sort();
            $.each(arrayespecies, function (index, value) {
                combospecie.append('<option value="' + value + '">' + value + '</option>');
            })
        });        
    }

    function fillIEOSurveys() {
        var queryTask,
            querysurveyIEO;

        queryTask = new QueryTask("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/IEO_Lances/MapServer/0");
        querysurveyIEO = new Query();
        querysurveyIEO.returnGeometry = false;
        querysurveyIEO.returnDistinctValues = true;
        querysurveyIEO.outFields = ["SEROBSMARACRONIMO"];
        querysurveyIEO.where = "1=1";
        queryTask.execute(querysurveyIEO, function GetResults(result) {
            var combosurveys = $("select[name='SurveyIEO']");
            var arraysurveys = [];
            $.each(result.features, function (index, value) {
                arraysurveys.push(value.attributes.SEROBSMARACRONIMO);
            });
            arraysurveys.sort();
            $.each(arraysurveys, function (index, value) {
                combosurveys.append('<option value="' + value + '">' + value + '</option>');
            })
        });
    }

    function fillIEOSpecie() {
        var surveyselected,
            queryTask,
            queryspecieIEO;

        surveyselected = $("select[name='SurveyIEO']").find("option:selected").val();
        queryTask = new QueryTask("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/IEO_Lances/MapServer/0");
        queryspecieIEO = new Query();
        queryspecieIEO.returnGeometry = false;
        queryspecieIEO.returnDistinctValues = true;
        queryspecieIEO.outFields = ["ESPDESTAX"];
        (surveyselected == "") ? queryspecieIEO.where = "1=1" : queryspecieIEO.where = "SEROBSMARACRONIMO = '" + surveyselected + "'";
        queryTask.execute(queryspecieIEO, function GetResults(result) {
            var combospecie = $("select[name='NamespeciesIEO']");
            combospecie.empty();
            var arrayspecie = [];
            $.each(result.features, function (index, value) {
                arrayspecie.push(value.attributes.ESPDESTAX);
            });
            arrayspecie.sort();
            combospecie.append('<option value="" selected disabled>Select a specie</option>');
            $.each(arrayspecie, function (index, value) {
                combospecie.append('<option value="' + value + '">' + value + '</option>');
            })
        });
    }

    //#endregion


    //#region Draw

    PropiedadesBiological.tb = new Draw(PropiedadesBiological.map);
    PropiedadesBiological.tb.on("draw-end", DrawResults);

    //#endregion

});

function SelectSamples() {
    require([
     "esri/tasks/query",
     "esri/tasks/QueryTask"
    ],
    function (Query, QueryTask) {
        var geometry,
              source,
              kingdom,
              namespecies,
              surveyIEO,
              namespeciesIEO,
              myquery;
        //#region Query
        source = $("select[name='Source']").find("option:selected").val();
        kingdom = $("select[name='Kingdom']").find("option:selected").val();
        namespecies = $("select[name='Namespecies']").find("option:selected").val();
        surveyIEO = $("select[name='SurveyIEO']").find("option:selected").val();
        namespeciesIEO = $("select[name='NamespeciesIEO']").find("option:selected").val();

        var OBISwhere = buildwhereOBIS(kingdom, namespecies);
        var IEOwhere = buildwhereIEO(surveyIEO, namespeciesIEO);

        switch (source) {
            case "IEO":
                myquery = new Query();
                myquery.where = IEOwhere;
                PropiedadesBiological.IEOLayer.queryFeatures(myquery, selectIEO);
                break;
            case "OBIS":
                myquery = new Query();
                myquery.where = OBISwhere;
                PropiedadesBiological.OBISLayer.queryFeatures(myquery, selectOBIS);
                break;
            case "BOTH":
                myqueryOBIS = new Query();
                myqueryOBIS.where = OBISwhere;
                PropiedadesBiological.OBISLayer.queryFeatures(myqueryOBIS, selectOBIS);
                myqueryIEO = new Query();
                myqueryIEO.where = IEOwhere;
                PropiedadesBiological.IEOLayer.queryFeatures(myqueryIEO, selectIEO);
                break
        }


        //#endregion
    });
}


function DrawPolygon() {
    PropiedadesBiological.map.graphics.clear();
    PropiedadesBiological.tb.activate(esri.toolbars.Draw.POLYGON);
}

//Función que maneja el resultado del dibujo
function DrawResults(evt) {
    require([
      "esri/Color",
      "esri/graphic",
      "esri/symbols/SimpleLineSymbol",
      "esri/symbols/SimpleFillSymbol",
      "esri/tasks/query",
      "esri/tasks/QueryTask"
    ],
      function (Color, Graphic, SimpleLineSymbol, SimpleFillSymbol, Query, QueryTask) {
          var geometry,
              symbol,
              source,
              kingdom,
              namespecies,
              surveyIEO,
              namespeciesIEO,
              myquery;

          PropiedadesBiological.tb.deactivate();

          // add the drawn graphic to the map
          var geometry = evt.geometry;
          console.log(geometry);
          symbol = new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 255]), 2),
            new Color([0, 0, 255, 0.5]));

          PropiedadesBiological.graphicarea = new Graphic(geometry, symbol);
          PropiedadesBiological.geometryquery = geometry;
          PropiedadesBiological.map.graphics.add(PropiedadesBiological.graphicarea);

          //#region Query
          source = $("select[name='Source']").find("option:selected").val();
          kingdom = $("select[name='Kingdom']").find("option:selected").val();
          namespecies = $("select[name='Namespecies']").find("option:selected").val();
          surveyIEO = $("select[name='SurveyIEO']").find("option:selected").val();
          namespeciesIEO = $("select[name='NamespeciesIEO']").find("option:selected").val();

          var OBISwhere = buildwhereOBIS(kingdom, namespecies);
          var IEOwhere = buildwhereIEO(surveyIEO, namespeciesIEO);
          
          switch (source) {
              case "IEO":
                  myquery = new Query();
                  myquery.geometry = geometry;
                  myquery.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
                  myquery.where = IEOwhere;
                  PropiedadesBiological.IEOLayer.queryFeatures(myquery, selectInPolygonIEO);
                  break;
              case "OBIS":
                  myquery = new Query();
                  myquery.geometry = geometry;
                  myquery.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
                  myquery.where = OBISwhere;
                  PropiedadesBiological.OBISLayer.queryFeatures(myquery, selectInPolygonOBIS);
                  break;
              case "BOTH":
                  myqueryOBIS = new Query();
                  myqueryOBIS.geometry = geometry;
                  myqueryOBIS.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
                  myqueryOBIS.where = OBISwhere;
                  PropiedadesBiological.OBISLayer.queryFeatures(myqueryOBIS, selectInPolygonOBIS);
                  myqueryIEO = new Query();
                  myqueryIEO.geometry = geometry;
                  myqueryIEO.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
                  myqueryIEO.where = IEOwhere;
                  PropiedadesBiological.IEOLayer.queryFeatures(myqueryIEO, selectInPolygonIEO);
                  break
          }


          //#endregion

      });

 
}

function buildwhereOBIS(kingdom, namespecies) {
    var where = "1=1";
    (kingdom != "") ? where = "Kingdom = '" + kingdom + "'" : "";
    (kingdom != "" && namespecies != "") ? where = where + " AND sname = '" + namespecies + "'" : "";
    (kingdom == "" && namespecies != "") ? where = "sname = '" + namespecies + "'" : "";
    return where;

}

function buildwhereIEO(surveyIEO, namespeciesIEO) {
    var where = "1=1";
    (surveyIEO != "") ? where = "SEROBSMARACRONIMO = '" + surveyIEO + "'" : "";
    (surveyIEO != "" && namespeciesIEO != "") ? where = where + " AND ESPDESTAX = '" + namespeciesIEO + "'" : "";
    (surveyIEO == "" && namespeciesIEO != "") ? where = "ESPDESTAX = '" + namespeciesIEO + "'" : "";
    return where;
}

function selectOBIS(response) {
    require([
       "esri/tasks/query",
       "esri/layers/FeatureLayer",
        "esri/InfoTemplate"
    ],
    function (Query, FeatureLayer, InfoTemplate) {
        var feature;
        var features = response.features;
        var objectIDs = [];
        
        $.each(features, function (index, feature) {
            objectIDs.push(feature.attributes[PropiedadesBiological.OBISLayer.objectIdField]);
        })

        var query = new Query();
        query.objectIds = objectIDs;
        //use a fast objectIds selection query (should not need to go to the server)
        PropiedadesBiological.OBISLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
            //Creo un array en el que almaceno los nombres de los campos para meterlos en el popup de cada entidad
            var fieldarray = [];
            //Creo un string que sera el que pase al Json del popup a la propidad content
            var mycontent = "";
            //recorro los nombres de cada entidad resultado
            $.each(results[0].attributes, function (index, field) {
                //Igualo a la variable myfield el nombre de cada campo
                var myfield = index;
                //me salto el campo OBJECTID porque no quiero añadirlo al template de mi popup
                if (myfield != "OBJECTID") {
                    //Añado los valores de campo al array fieldarray con el formato adecuado para generar el string que luego añadire al template
                    fieldarray.push(myfield + ": ${" + myfield + "}<br/>");
                }
            });
            //Recorro el array con los nombres del array y genero el string que es el tipo de variable que va ha aceptar el template
            $.each(fieldarray, function (index, value) {
                mycontent += value;
            });
            PropiedadesBiological.OBISPopupInfoTemplate = new InfoTemplate("Biological Index", mycontent);
            PropiedadesBiological.OBISLayer.setInfoTemplate(PropiedadesBiological.OBISPopupInfoTemplate);
            zoomToResult(results);
            // PropiedadesBiological.OBISLayer.setVisibility(true);
        });

    });
}

function selectIEO(response) {
    require([
        "esri/tasks/query",
        "esri/layers/FeatureLayer",
        "esri/InfoTemplate"
    ],
     function (Query, FeatureLayer, InfoTemplate) {
         var feature;
         var features = response.features;
         var objectIDs = [];
         var biomass = [];
         var abundance = [];
         var richness = [];
         var TroficIndex = [];
         var final_biomass = 0;
         var final_abundance = 0;
         var final_richness = 0;
         var final_TroficIndex = 0;
         $.each(features, function (index, value) {
             feature = value;
             objectIDs.push(feature.attributes[PropiedadesBiological.IEOLayer.objectIdField]);
             biomass.push(feature.attributes.BIOMASA);
             if (feature.attributes.BIOMASA != null) {
                 final_biomass += parseInt(feature.attributes.BIOMASA);
             }
             abundance.push(feature.attributes.ABUNDANCIA);
             if (feature.attributes.ABUNDANCIA != null) {
                 final_abundance += parseInt(feature.attributes.ABUNDANCIA);
             }             
         });

         final_biomass = (final_biomass / biomass.length) / 1000;

         final_abundance = (final_abundance / abundance.length) / 1000;

         //final_richness = (final_richness / richness.length) / 10;
         final_richness = 0;
         //final_TroficIndex = (final_TroficIndex / TroficIndex.length);
         final_TroficIndex = 0;

         $("#Abundance").html(final_abundance.toString());
         $("#Richness").html(final_richness.toString());
         $("#Biomass").html(final_biomass.toString());
         $("#TroficIndex").html(final_TroficIndex.toString());

         generateChart(final_biomass, final_abundance, final_richness, final_TroficIndex);

         var query = new Query();
         query.objectIds = objectIDs;
         //use a fast objectIds selection query (should not need to go to the server)
         PropiedadesBiological.IEOLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
             //Creo un array en el que almaceno los nombres de los campos para meterlos en el popup de cada entidad
             var fieldarray = [];
             //Creo un string que sera el que pase al Json del popup a la propidad content
             var mycontent = "";
             //recorro los nombres de cada entidad resultado
             $.each(results[0].attributes, function (index, field) {
                 //Igualo a la variable myfield el nombre de cada campo
                 var myfield = index;
                 //me salto el campo OBJECTID porque no quiero añadirlo al template de mi popup
                 if (myfield != "OBJECTID") {
                     //Añado los valores de campo al array fieldarray con el formato adecuado para generar el string que luego añadire al template
                     fieldarray.push(myfield + ": ${" + myfield + "}<br/>");
                 }
             });
             //Recorro el array con los nombres del array y genero el string que es el tipo de variable que va ha aceptar el template
             $.each(fieldarray, function (index, value) {
                 mycontent += value;
             });
             PropiedadesBiological.IeoPopupInfoTemplate = new InfoTemplate("Biological Index", mycontent);
             PropiedadesBiological.IEOLayer.setInfoTemplate(PropiedadesBiological.IeoPopupInfoTemplate);

             //PropiedadesBiological.IEOLayer.setVisibility(true);
             zoomToResult(results);
         });

         $('#AddSerieButton').prop("disabled", false);

     });

}

function selectInPolygonOBIS(response) {
    require([
        "esri/tasks/query",
        "esri/layers/FeatureLayer",
        "esri/InfoTemplate"
    ],
     function (Query, FeatureLayer, InfoTemplate) {
         var feature;
         var features = response.features;
         var inBuffer = [];
         //filter out features that are not actually in buffer, since we got all points in the buffer's bounding box
         
         for (var i = 0; i < features.length; i++) {
             feature = features[i];

             if (PropiedadesBiological.graphicarea.geometry.contains(feature.geometry)) {
                 inBuffer.push(feature.attributes[PropiedadesBiological.OBISLayer.objectIdField]);
             }
         }

         var query = new Query();
         query.objectIds = inBuffer;
         //use a fast objectIds selection query (should not need to go to the server)
         PropiedadesBiological.OBISLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
             //Creo un array en el que almaceno los nombres de los campos para meterlos en el popup de cada entidad
             var fieldarray = [];
             //Creo un string que sera el que pase al Json del popup a la propidad content
             var mycontent = "";
             //recorro los nombres de cada entidad resultado
             $.each(results[0].attributes, function (index, field) {
                 //Igualo a la variable myfield el nombre de cada campo
                 var myfield = index;
                 //me salto el campo OBJECTID porque no quiero añadirlo al template de mi popup
                 if (myfield != "OBJECTID") {
                     //Añado los valores de campo al array fieldarray con el formato adecuado para generar el string que luego añadire al template
                     fieldarray.push(myfield + ": ${" + myfield + "}<br/>");
                 }
             });
             //Recorro el array con los nombres del array y genero el string que es el tipo de variable que va ha aceptar el template
             $.each(fieldarray, function (index, value) {
                 mycontent += value;
             });
             PropiedadesBiological.OBISPopupInfoTemplate = new InfoTemplate("Biological Index", mycontent);
             PropiedadesBiological.OBISLayer.setInfoTemplate(PropiedadesBiological.OBISPopupInfoTemplate);
             zoomToResult(results);
            // PropiedadesBiological.OBISLayer.setVisibility(true);
         });
         
     });    
}

function selectInPolygonIEO(response) {
    console.log(response);
    require([
        "esri/tasks/query",
        "esri/layers/FeatureLayer",
        "esri/InfoTemplate"
    ],
     function (Query, FeatureLayer, InfoTemplate) {
         var feature;
         var features = response.features;
         var inBuffer = [];
         var biomass = [];
         var abundance = [];
         var richness = [];
         var TroficIndex = [];
         var final_biomass = 0;
         var final_abundance = 0;
         var final_richness = 0;
         var final_TroficIndex = 0;
         $.each(features, function (index, value) {
             feature = value;
             if (PropiedadesBiological.geometryquery.contains(feature.geometry)) {
                 inBuffer.push(feature.attributes[PropiedadesBiological.IEOLayer.objectIdField]);
                 biomass.push(feature.attributes.BIOMASA);
                 if (feature.attributes.BIOMASA != null) {
                     final_biomass += parseInt(feature.attributes.BIOMASA);
                 }
                 abundance.push(feature.attributes.ABUNDANCIA);
                 if (feature.attributes.ABUNDANCIA != null) {
                     final_abundance += parseInt(feature.attributes.ABUNDANCIA);
                 }
                 //richness.push(feature.attributes.Richness);
                 //if (feature.attributes.Richness != null) {
                 //    final_richness += feature.attributes.Richness;
                 //}
                 //TroficIndex.push(feature.attributes.Trofic_Index);
                 //if (feature.attributes.TroficIndex != null) {
                 //    final_TroficIndex += feature.attributes.TroficIndex;
                 //}
             }
         });

         final_biomass = (final_biomass / biomass.length) / 1000;

         final_abundance = (final_abundance / abundance.length) / 1000;

         //final_richness = (final_richness / richness.length) / 10;

         //final_TroficIndex = (final_TroficIndex / TroficIndex.length);

         $("#Abundance").html(final_abundance.toString());
         $("#Richness").html(final_richness.toString());
         $("#Biomass").html(final_biomass.toString());
         $("#TroficIndex").html(final_TroficIndex.toString());

         generateChart(final_biomass, final_abundance, final_richness, final_TroficIndex);

         var query = new Query();
         query.objectIds = inBuffer;
         //use a fast objectIds selection query (should not need to go to the server)
         PropiedadesBiological.IEOLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
             //Creo un array en el que almaceno los nombres de los campos para meterlos en el popup de cada entidad
             var fieldarray = [];
             //Creo un string que sera el que pase al Json del popup a la propidad content
             var mycontent = "";
             console.log(results);
             //recorro los nombres de cada entidad resultado
             $.each(results[0].attributes, function (index, field) {
                 //Igualo a la variable myfield el nombre de cada campo
                 var myfield = index;
                 //me salto el campo OBJECTID porque no quiero añadirlo al template de mi popup
                 if (myfield != "OBJECTID") {
                     //Añado los valores de campo al array fieldarray con el formato adecuado para generar el string que luego añadire al template
                     fieldarray.push(myfield + ": ${" + myfield + "}<br/>");
                 }
             });
             //Recorro el array con los nombres del array y genero el string que es el tipo de variable que va ha aceptar el template
             $.each(fieldarray, function (index, value) {
                 mycontent += value;
             });
             PropiedadesBiological.IeoPopupInfoTemplate = new InfoTemplate("Biological Index", mycontent);
             PropiedadesBiological.IEOLayer.setInfoTemplate(PropiedadesBiological.IeoPopupInfoTemplate);
             zoomToResult(results);

             //PropiedadesBiological.IEOLayer.setVisibility(true);
         });

         $('#AddSerieButton').prop("disabled", false);

     });
}

//#endregion

//#region Buffer selection
function ShowBufferPanel() {
    $('#Geodesic_Panel').show();
    $('#BiologicalData_Panel').hide();
    PropiedadesBiological.map.graphics.clear();
}

function BiologicalqueryBuffer(geometry) {
    require([
      "esri/tasks/query",
      "esri/tasks/QueryTask"
    ],
      function (Query, QueryTask) {
          PropiedadesBiological.geometryquery = geometry;
          source = $("select[name='Source']").find("option:selected").val();
          kingdom = $("select[name='Kingdom']").find("option:selected").val();
          namespecies = $("select[name='Namespecies']").find("option:selected").val();
          surveyIEO = $("select[name='SurveyIEO']").find("option:selected").val();
          namespeciesIEO = $("select[name='NamespeciesIEO']").find("option:selected").val();

          var OBISwhere = buildwhereOBIS(kingdom, namespecies);
          var IEOwhere = buildwhereIEO(surveyIEO, namespeciesIEO);

          switch (source) {
              case "IEO":
                  myquery = new Query();
                  myquery.geometry = geometry;
                  myquery.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
                  myquery.where = IEOwhere;
                  PropiedadesBiological.IEOLayer.queryFeatures(myquery, selectInPolygonIEO);
                  break;
              case "OBIS":
                  myquery = new Query();
                  myquery.geometry = geometry;
                  myquery.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
                  myquery.where = OBISwhere;
                  PropiedadesBiological.OBISLayer.queryFeatures(myquery, selectInPolygonOBIS);
                  break;
              case "BOTH":
                  myqueryOBIS = new Query();
                  myqueryOBIS.geometry = geometry;
                  myqueryOBIS.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
                  myqueryOBIS.where = OBISwhere;
                  PropiedadesBiological.OBISLayer.queryFeatures(myqueryOBIS, selectInPolygonOBIS);
                  myqueryIEO = new Query();
                  myqueryIEO.geometry = geometry;
                  myqueryIEO.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
                  myqueryIEO.where = IEOwhere;
                  PropiedadesBiological.IEOLayer.queryFeatures(myqueryIEO, selectInPolygonIEO);
                  break
          }
          $('#BiologicalData_Panel').show();
      });   
}

function UseGeodesicTools() {
    CreateBuffer(PropiedadesBiological.map);

    $('#Geodesic_Panel').hide();
}

function zoomToResult(featureSet) {
    require([
      "esri/graphicsUtils",
    ],
      function (graphicsUtils) {
          var myextent = graphicsUtils.graphicsExtent(featureSet);
          PropiedadesBiological.map.setExtent(myextent);
      });
}

//#endregion

//#region Graphs Biological Data

function RemoveGraph(id) {
    console.log(id);
}

function generateChart(final_biomass, final_abundance, final_richness, final_TroficIndex) {
    require([
        'highcharts', 'highcharts-more', 'highcharts-data', 'exporting-highcharts'],
        function () {
            var idchart = "#PieChartBiologicalData";
            if (PropiedadesBiological.numberChart == 0) {
                idchart += "0"
                $('#titletableGraphsBiological').show();
            }
            else if (PropiedadesBiological.numberChart % 2) {
                //es impar
                console.log('impar');
                var index = String(PropiedadesBiological.numberChart - 1);
                var columna = '<td class="col-lg-6 cellGraphBio"><button id="remove_PieChartBiologicalData' + String(PropiedadesBiological.numberChart) + '" type="button" class="btn btn-xs btn-primary btn-navegacion buttonRemoveChartBio" onclick="RemoveGraph(this.id)">Remove</button><div id="PieChartBiologicalData' + String(PropiedadesBiological.numberChart) + '"></div></td>';
                $('#row' + index).append(columna);
                idchart += String(PropiedadesBiological.numberChart);

            }
            else {
                //es par
                console.log('impar');
                var index = String(PropiedadesBiological.numberChart);
                var fila = '<tr id="row' + String(PropiedadesBiological.numberChart) + '" class="row rowGraphBio"></tr>';
                $('#tableGraphs').append(fila);
                var columna = '<td class="col-lg-6 cellGraphBio"><button id="remove_PieChartBiologicalData' + String(PropiedadesBiological.numberChart) + '" type="button" class="btn btn-xs btn-primary btn-navegacion buttonRemoveChartBio" onclick="RemoveGraph(this.id)">Remove</button><div id="PieChartBiologicalData' + String(PropiedadesBiological.numberChart) + '"></div></td>';
                $('#row' + index).append(columna);
                idchart += String(PropiedadesBiological.numberChart);
            }
            PropiedadesBiological.numberChart++

            var surveyIEO = $("select[name='SurveyIEO']").find("option:selected").val();
            var namespeciesIEO = $("select[name='NamespeciesIEO']").find("option:selected").val();

            // Parse the data from an inline table using the Highcharts Data plugin
            var chart = $(idchart).highcharts({
                credits: {
                    enabled: false
                },

                data: {
                    table: 'dataindex',
                    startRow: 1,
                    endRow: 5,
                    endColumn: 4,
                },

                chart: {
                    renderTo: 'PieChartBiologicalData',
                    polar: true,
                    type: 'column',
                    events: {
                        load: function () {
                            this.credits.element.onclick = function () {
                                window.open(
                          'http://www.ieo.es/',
                          '_blank'
                        );
                            }
                        }
                    }
                },

                title: {
                    text: surveyIEO + " " + namespeciesIEO,
                    align: 'center',
                    style: {
                        color: '#018FE2',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }
                },
                pane: {
                    size: '85%'
                },
                legend: {
                    reversed: true,
                    align: 'right',
                    verticalAlign: 'top',
                    x: 10,
                    y: 50,
                    layout: 'vertical',
                    title: {
                        text: 'Biological Index<br/><span style="font-size: 9px; color: #666; font-weight: normal">(Click to change selection)</span>',
                        style: {
                            fontStyle: 'italic'
                        }
                    }
                },
                xAxis: {
                    min: 0,
                    align: 'center'
                },
                yAxis: {
                    min: 0,
                    endOnTick: false,
                    showLastLabel: true,
                    labels: {
                        format: '{value}'
                    }
                },

                tooltip: {
                    formatter: function () {
                        return this.series.name + ': <b>' + this.y + '</b>';
                    }
                },
                credits: {
                    text: 'source',
                    style: {
                        cursor: 'pointer',
                        fontSize: '12px'
                    }

                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        shadow: false,
                        groupPadding: 0,
                        pointPlacement: 'on'
                    }
                }
            });
            mychart = chart.highcharts();

            //$('#rowGraphBiologicalData').show();
            $('#tableGraphs').show();

        });
}


//#endregion


//#region Tables Biological Data

//#endregion

//#region Clear
function clearGraphics() {
    (PropiedadesBiological.map.getLayer('OBIS')) ? PropiedadesBiological.map.removeLayer(PropiedadesBiological.map.getLayer('OBIS')) : "";
    (PropiedadesBiological.map.getLayer('IEO')) ? PropiedadesBiological.map.removeLayer(PropiedadesBiological.map.getLayer('IEO')) : "";
    PropiedadesBiological.map.clearGraphics();
}
//#endregion