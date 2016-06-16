
var PropiedadesOceanTransects = new Object();
PropiedadesOceanTransects.VariablesGlobales = ['map', 'startExtent', 'tb'];

cargarvariablesGlobales();

function cargarvariablesGlobales() {
    $.each(PropiedadesOceanTransects.VariablesGlobales, function (index, value) {
        PropiedadesOceanTransects[value] = undefined;
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
    "esri/toolbars/draw",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojo/dom",
    "dojo/on",
    "dojo/_base/declare",
    "esri/config",
    "dojo/parser",
    "dojo/domReady!"
], function (urlUtils, Map, Navigation, BasemapToggle, OverviewMap, Legend, Extent,
    GraphicsLayer, webMercatorUtils, Draw, array, domConstruct, dom, on, declare, esriConfig, parser
) {
    esriConfig.defaults.io.proxyUrl = "../proxy/proxy.php";
    parser.parse();

    //Variable con la extensión inicial del mapa 
    PropiedadesOceanTransects.startExtent = new Extent(-50, 12, 0, 41, new esri.SpatialReference({ wkid: 4326 }));

    PropiedadesOceanTransects.map = new Map("mapDiv", {
        extent: PropiedadesOceanTransects.startExtent,
        center: [-20, 26],
        basemap: "oceans",
        logo: false
    });

    //#region Maxima extensión del mapa
    var navToolbar = new Navigation(PropiedadesOceanTransects.map);
    //Constreñimos la extensión del mapa a la inicial por medio del evento onextentchange.
    on(PropiedadesOceanTransects.map, "extent-change", function (extent) {
        var buffer = 20; //En mi caso 1 grado
        // set costraint extent to initExtent +buffer
        var constraintExtent = new esri.geometry.Extent(PropiedadesOceanTransects.startExtent.xmin - buffer, PropiedadesOceanTransects.startExtent.ymin - buffer, PropiedadesOceanTransects.startExtent.xmax + buffer, PropiedadesOceanTransects.startExtent.ymax + buffer);
        if (!constraintExtent.contains(extent.extent) || !constraintExtent.intersects(extent.extent)) {
            // zoom back to previous extent
            navToolbar.zoomToPrevExtent();
        }
    });
    //#endregion

    //#region Draw
    console.log('hola');
    PropiedadesOceanTransects.tb = new Draw(PropiedadesOceanTransects.map);
    PropiedadesOceanTransects.tb.on("draw-end", DrawResults);

    //#endregion

});
//#endregion

//#region Selection, queries and geoprocess
$("select[name='OceanParameter']").on('change', function () {
    changecombo();
});
$("select[name='Month']").on('change', function () {
    changecombo()
});

$("select[name='Year']").on('change', function () {
    changecombo()
});

function changecombo() {
    PropiedadesOceanTransects.OceanParameter = $("select[name='OceanParameter']").find("option:selected").val();
    PropiedadesOceanTransects.Month = $("select[name='Month']").find("option:selected").val();
    PropiedadesOceanTransects.Year = $("select[name='Year']").find("option:selected").val();
    (PropiedadesOceanTransects.OceanParameter != "" && PropiedadesOceanTransects.Month != "" && PropiedadesOceanTransects.Year != "") ? $("#ProfileDrawButton").prop("disabled", false) : $("#CreateGraph").prop("disabled", true);
}

function CreateGraph() {
    PropiedadesOceanTransects.map.graphics.clear();
    PropiedadesOceanTransects.tb.activate(esri.toolbars.Draw.POLYLINE);
}

function DrawResults(evt) {
    require([
      "esri/Color",
          "esri/graphic",
          "esri/symbols/SimpleLineSymbol",
          "esri/tasks/Geoprocessor",
          "esri/geometry/geodesicUtils",
          "esri/units",
          "esri/tasks/FeatureSet"
    ],
      function (Color, Graphic, SimpleLineSymbol, Geoprocessor, geodesicUtils, Units, FeatureSet) {
          // Añadimos el gráfico dibujado al mapa
          var geometry = evt.geometry;
          var symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 255]), 2);

          PropiedadesOceanTransects.graphicline = new Graphic(geometry, symbol);
          PropiedadesOceanTransects.map.graphics.add(PropiedadesOceanTransects.graphicline);

          //Instanciamos el objeto de geoprocesamiento
          PropiedadesOceanTransects.gp = new Geoprocessor("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/StackProfile/GPServer/Stack%20Profile");

          //Creamos los parámetros para añadirlos al servicio de geoprocesamiento
          var features = [];
          features.push(PropiedadesOceanTransects.graphicline);
          var featureSet = new FeatureSet();
          featureSet.features = features;

          var params = {
              "in_line_features": featureSet
          };
          PropiedadesOceanTransects.gp.submitJob(params, gpfinish);
      });
}

function gpfinish(results, messages) {
    PropiedadesOceanTransects.gp.getResultData(results.jobId, "out_table", gpresult);
}

function gpresult(results) {

    arrayDistaciaZ = [];
    if (results.value.features[0]) {
        var i = 0;
        while (i < results.value.features.length) {
            arrayDistaciaZ.push({ "Distancia": results.value.features[i].attributes.FIRST_DIST, "Altura": results.value.features[i].attributes.FIRST_Z });
            i++
        }

        var arrayParaPerfil = {
            "symbol": "Perfil",
            "datos": arrayDistaciaZ
        };

        showProfile(arrayParaPerfil);
        return arrayParaPerfil;
    }
}

//#endregion


//#region Graph

function showProfile(arrayParaPerfil) {
    require(['highcharts', 'exporting-highcharts'], function () {

        var line = PropiedadesOceanTransects.graphicline.geometry;
        var arrayLocate = [];
        for (var i = 0; i < arrayParaPerfil.datos.length; i++) {
            var arraytemp = [];
            var position = arrayParaPerfil.datos[i].Distancia;
            LRSLocatePoint(line, position, PropiedadesOceanTransects.map);
            arrayLocate.push({ Distance: position, Point: mypoint });
        }

        var linepaths = line.paths[0];

        var myspatialReference = line.spatialReference;

        var pointinit = new esri.geometry.Point(linepaths[0], myspatialReference);
        var pointend = new esri.geometry.Point(linepaths[linepaths.length - 1], myspatialReference);
        var geopointinit = esri.geometry.webMercatorToGeographic(pointinit);
        var geopointend = esri.geometry.webMercatorToGeographic(pointend);
        var longinit, latinit, longend, latend;

        if (geopointinit.x >= 0) {
            longinit = "E";
        }

        else {
            longinit = "W";
        }

        if (geopointinit.y >= 0) {
            latinit = "N";
        }

        else {
            latinit = "S";
        }

        if (geopointend.x >= 0) {
            longend = "E";
        }

        else {
            longend = "W";
        }

        if (geopointend.y >= 0) {
            latend = "N";
        }

        else {
            latend = "S";
        }

        arraydatosperfil = [];
        var arraypoint = [];
        var arraycoordy = [];

        for (var i = 0; i < arrayParaPerfil.datos.length; i++) {

            arraypoint.push(arrayParaPerfil.datos[i].Distancia);

            if (arrayParaPerfil.datos[i].Altura > 33) {
                arraypoint.push(null);
            }

            else {
                arraypoint.push(arrayParaPerfil.datos[i].Altura);
                arraycoordy.push(arrayParaPerfil.datos[i].Altura);
            }

            arraydatosperfil.push(arraypoint);
            arraypoint = [];
        }


        //Ordeno el array arraycoordy de menor a mayor
        function ordAscModif(a, b) {
            if (a < b) return -1;
            if (a > b) return 1;
            if (a = b) return 0;
        }

        arraycoordy.sort(ordAscModif);

        //Cojo el valor menor del array para utilizarlo como límite en el eje y de mi gráfico
        var miny = arraycoordy[0];


        $(function () {
            var chart = $('#ChartOceanTransectData').highcharts({
                chart: {
                    type: 'area',
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
                    text: 'Oceanographic Parameter Profile',
                    align: 'center',
                    style: {
                        color: '#018FE2',
                        fontSize: '20px',
                        fontWeight: 'bold'
                    }
                },

                xAxis: {
                    allowDecimals: false,
                    labels: {
                        formatter: function () {
                            return this.value / 1000 + " km"; // clean, unformatted number for year
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: 'Temperature'
                    },
                    labels: {
                        formatter: function () {
                            return this.value + ' ºC';
                        }
                    },
                    min: miny

                },
                tooltip: {
                    headerFormat: '',
                    pointFormat: '{series.name} <b>{point.y:,.2f} ºC</b>'
                },
                credits: {
                    text: 'source',
                    style: {
                        cursor: 'pointer',
                        fontSize: '12px'
                    }

                },
                plotOptions: {
                    area: {
                        //pointStart: 0,
                        marker: {
                            enabled: false,
                            symbol: 'circle',
                            radius: 2,
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        }
                    },

                    series: {
                        point: {
                            events: {
                                mouseOver: function () {
                                    for (var i = 0; i < arrayLocate.length; i++) {
                                        if (arrayLocate[i].Distance == this.x) {
                                            DrawPoint(arrayLocate[i].Point);
                                        }
                                    }
                                }
                            }
                        },
                        events: {
                            mouseOut: function () {
                                PropiedadesOceanTransects.map.graphics.remove(PropiedadesGisTools.graphicX);
                            }
                        }
                    }
                },

                subtitle: {
                    text: 'Profile From: ' + Math.abs(geopointinit.x.toFixed(3)) + 'º' + longinit + "    " + Math.abs(geopointinit.y.toFixed(3)) + 'º' + latinit + "  -  " + 'To: ' + Math.abs(geopointend.x.toFixed(3)) + 'º' + longend + "    " + Math.abs(geopointend.y.toFixed(3)) + 'º' + latend
                },

                series: [{
                    name: 'Temperature',
                    data: arraydatosperfil,
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                                [0, Highcharts.getOptions().colors[0]],
                                [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    }
                }]
            });

            //mychart2 = chart.highcharts();
        });
    });
}

//#endregion