//Script con herramientas para hacer calculos geográficos

var PropiedadesGisTools = new Object();
PropiedadesGisTools.map = undefined;
PropiedadesGisTools.PropiedadesGisTools.graphicX = undefined;

function LRSLocatePoint(line, position, map) {
    require([
        "esri/geometry/Point"
    ],
        function (Point) {
            //Igualo mi variable mapa al mapa pasado en la función, así puedo usar este script en otras vistas
            PropiedadesGisTools.map = map;
            //Variable que voy a utilizar como punto mas lejano para calcular la posición, comienza con valor 0
            var curPos = 0;
            //Cojo la referencia espacial de la línea
            var myspatialReference = line.spatialReference;
            //Variable con el array de todos los paths de la línea
            var arraylinepaths = line.paths[0];

            //Creo un array con los puntos que tengo de todos los paths, el array va desde el origen de la línea hasta el final de la misma
            var arraypoints = [];
            for (var i = 0; i < arraylinepaths.length; i++) {
                arraypoints.push(Point(arraylinepaths[i], myspatialReference));
            }

            //Calculo las distancias que hay desde el origen de la línea a cada uno de los puntos que he almacenado en el arraypoints, por tanto las distancias van de menor a mayor
            var distance = 0;
            var arraydistances = [];
            var i = 0;
            var e = 1;
            while (e < arraypoints.length) {
                distance = distance + esri.geometry.getLength(arraypoints[i], arraypoints[e]);
                arraydistances.push(distance);
                i++;
                e++;
            }
            
            //Comparo las distancias con la posición que me viene del perfil y cuando la distancia es mayor que la posición del perfil, salgo del bucle.
            //Mi posición del perfil se encontraría entre el valor de la variable lastPost, que es mas cercano al origen de la línea, y el valor de la variable curPost, mas lejano al origen de la línea
            for (var j = 0; j < arraydistances.length; j++) {
                lastPos = curPos;
                if (position < arraydistances[j]) {
                    curPos = arraydistances[j];
                    break;
                }
                else {
                    curPos = arraydistances[j];
                    continue;
                }

            }

            //Como mi posición se encuentra entre las posiciones lastPos y curPos, calculo la posición relativa de la misma con respecto a estos dos puntos
            var posicionRelativa = (position - lastPos) / (curPos - lastPos);
            //Llamo a la función LRSLocatePointOnSegment que me devuelve un punto con las coordenadas de la posicion relativa. 
            mypoint = LRSLocatePointOnSegment(
                        arraylinepaths[j],
                        arraylinepaths[j + 1],
                        posicionRelativa
                    );
            //Devuelvo la longitud de mi punto
            return mypoint.x;

        });

}


function LRSLocatePointOnSegment(point1, point2, position) {
    var point = false;
    if (position >= 0 && position <= 1) {
        x1 = point1[0];
        y1 = point1[1];
        x2 = point2[0];
        y2 = point2[1];
        x = x1 + (x2 - x1) * position;
        y = y1 + (y2 - y1) * position;
        var spatialReference = PropiedadesGisTools.map.spatialReference;
        point = new esri.geometry.Point(x, y, spatialReference);
    }
    return point;
}

//Función que dibuja la X en según el punto devuelto de las funciones anteriores. Se la llama desde el evento MouseOver del perfil
function DrawPoint(point) {
    require([
       "esri/geometry/geodesicUtils",
       "esri/units",
       "esri/Color",
       "esri/symbols/SimpleLineSymbol",
       "esri/graphic",
       "esri/symbols/SimpleMarkerSymbol"
    ],
       function (geodesicUtils, Units, Color, SimpleLineSymbol, Graphic, SimpleMarkerSymbol) {
           PropiedadesGisTools.map.graphics.remove(PropiedadesGisTools.graphicX);
           // CREATE LOCATION GRAPHIC //
           var red = new Color(Color.named.red);
           var outline = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, red, 3);
           var chartLocationSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_X, 13, outline, red);

           PropiedadesGisTools.graphicX = new Graphic(point, chartLocationSymbol);

           PropiedadesGisTools.map.graphics.add(PropiedadesGisTools.graphicX);

           
       });
}