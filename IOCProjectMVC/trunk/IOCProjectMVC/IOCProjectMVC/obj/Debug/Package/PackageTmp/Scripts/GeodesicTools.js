// Script donde está la funcionalidad para usar geoprocesamientos como buffers en cliente
var PropiedadesGeodesicTools = new Object();
PropiedadesGeodesicTools.map = undefined;
PropiedadesGeodesicTools.tb = null;

// Función que se ejecuta al presionar el botón Query. Nos muestra el panel de consultas
function ShowGeodesicPanel() {
    if (dojo.byId("Geodesic_Panel").style.display == "none") {
        var e = dojo.byId("GeodesicMethod");
        var f = dojo.byId("Unit");
        var g = dojo.byId("Distance");
        var method = e.options[e.selectedIndex].value;
        var unit = f.options[f.selectedIndex].value;
        var distance = g.value;
        if (method != "" && unit != "" && distance > 0) {
            dojo.byId("CreateBuffer").disabled = false;
        }
        else {
            dojo.byId("CreateBuffer").disabled = true;
        }
        dojo.byId("Geodesic_Panel").style.display = "block";
    }

    else {
        dojo.byId("Geodesic_Panel").style.display = "none";
    }
}

function Option_selected() {
    var e = dojo.byId("GeodesicMethod");
    var f = dojo.byId("Unit");
    var g = dojo.byId("Distance");
    var method = e.options[e.selectedIndex].value;
    var unit = f.options[f.selectedIndex].value;
    var distance = g.value;
    if (method != "" && unit != "" && distance > 0) {
        dojo.byId("CreateBuffer").disabled = false;
    }
    else {
        var p = dojo.byId("CreateBuffer").disabled = true;
    }
}

function CreateBuffer(map) {
    require([
        "dojo/_base/array",
        "esri/geometry/geometryEngine",
        "esri/toolbars/draw",
        "esri/Color",
        "esri/graphic",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleFillSymbol"
    ], function (array, geometryEngine, Draw, Color, Graphic, SimpleLineSymbol, SimpleMarkerSymbol, SimpleFillSymbol) {
        //Igualo mi variable mapa al mapa pasado en la función, así puedo usar este script en otras vistas
        PropiedadesGeodesicTools.map = map;
        PropiedadesGeodesicTools.tb = new Draw(PropiedadesGeodesicTools.map);
        PropiedadesGeodesicTools.tb.on("draw-end", DrawResults);
        PropiedadesGeodesicTools.tb.activate(Draw.POINT);

        function DrawResults(evt) {
            // add the drawn graphic to the map
            var geometry = evt.geometry;

            var symbol = new SimpleMarkerSymbol(
              SimpleMarkerSymbol.STYLE_CIRCLE,
              12,
              new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_NULL,
                new Color([0, 0, 255, 0.9]),
                1
              ),
              new Color([0, 0, 255, 0.5])
            );

            var graphicpoint = new Graphic(geometry, symbol);
            PropiedadesGeodesicTools.map.graphics.add(graphicpoint);

            var e = dojo.byId("GeodesicMethod");
            var f = dojo.byId("Unit");
            var g = dojo.byId("Distance");
            var method = e.options[e.selectedIndex].value;
            var unit = parseInt(f.options[f.selectedIndex].value);
            var distance = g.value;
            var bufferedGeometries;
            switch (method) {
                case "Euclidean":
                    bufferedGeometries = geometryEngine.buffer(geometry, [distance], unit, true);
                    break;
                case "Geodesic":
                    bufferedGeometries = geometryEngine.geodesicBuffer(geometry, [distance], unit, true);
                    break;
            }

            //when buffer is done set up renderer and add each geometry to the map's graphics layer as a graphic
            var symbol2 = new SimpleFillSymbol();
            symbol2.setColor(new Color([100, 100, 100, 0.25]));
            symbol2.setOutline(null);
            var path = getAbsolutePath();
            //Si estamos en Biological Data hago una query con la geometría
            (path == "BiologicalData" || path == "BiologicalData#") ? BiologicalqueryBuffer(bufferedGeometries) : "";
            PropiedadesGeodesicTools.map.graphics.add(new Graphic(bufferedGeometries, symbol2));
            array.forEach(bufferedGeometries, function (buffergeometry) {
                PropiedadesGeodesicTools.map.graphics.add(new Graphic(buffergeometry, symbol2));
            });
            PropiedadesGeodesicTools.tb.deactivate()
        }

    });
}

//Función para permitir solo numeros en el input de Distancia
function checkInput(ob) {
    var invalidChars = /[^0-9]/gi
    if (invalidChars.test(ob.value)) {
        ob.value = ob.value.replace(invalidChars, "");
    }

    var e = dojo.byId("GeodesicMethod");
    var f = dojo.byId("Unit");
    var g = dojo.byId("Distance");
    var method = e.options[e.selectedIndex].value;
    var unit = f.options[f.selectedIndex].value;
    var distance = g.value;
    if (method != "" && unit != "" && distance > 0) {
        dojo.byId("CreateBuffer").disabled = false;
    }
    else {
        var p = dojo.byId("CreateBuffer").disabled = true;
    }
}

function getAbsolutePath() {
    var loc = window.location;
    var pathName = loc;
    var loc_array = loc.pathname.split("/");
    return loc_array[loc_array.length - 1];
}