/* custom JavaScript file by Jasmin Becerra, 2017 */
//main.js for Leaflet Lab

//function to instantiate the Leaflet map
function createMap(){
    //create the map linked to div id 'mapid' from index
    var mymap = L.map('mapid', {
        center: [20, 0],
        zoom: 3
    });

    //add base tilelayer (from mapbox + open street map)
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.light'
    }).addTo(mymap);

    //call getData function (define below)
    getData(mymap);
};



//function to retrieve the data and place it on the map
function getData(mymap){
    //load the data
    $.ajax("data/RefugeeDataMap.geojson", {
        dataType: "json",
        success: function(response){
        	//create marker options (set POI symbols to circles)
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#72a393",
                color: "#4e7265",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };


            //add our MegaCitiesMap geoJSON data via a geoJSON layer using the L. method
            //added optional paramter to make POI symbols circles
            //added onFeature: onEachFeature here, so that I preserved the circle markers
            //and also called the onEachFeature function for population info pop-ups
            L.geoJson(response, {onEachFeature: onEachFeature,
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(mymap);
        }
    });
};


function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};



$(document).ready(createMap);

