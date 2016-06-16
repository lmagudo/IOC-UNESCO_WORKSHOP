var map;

require([
    "esri/map",
    "dojo/domReady!"], function (Map) {
        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 200;
        $("#mapDiv").css("min-height", (height) + "px");
        //$("#mapDiv").css("min-height", "400px");
        map = new Map("mapDiv", {
            center: [-56.049, 38.485],
            zoom: 3,
            basemap: "streets"
    });
});