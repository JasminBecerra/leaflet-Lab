/* custom JavaScript file by Jasmin Becerra, 2017 */
//main.js for Leaflet Lab assignment

//function to instantiate the Leaflet map
function createMap(){
    //create the map linked to div id 'mapid' from index
    var mymap = L.map('mapid', {
        center: [20, 0],
        zoom: 2
    });

    //add base tilelayer (from mapbox + open street map)
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamFzbWluYmVjIiwiYSI6ImNpdXlobG1raDA1MTAybmxnOXRhbTEwaW8ifQ.my00Kwcjtd9QoxJrA3sETA', {
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


            //added geoJSON data via a geoJSON layer using the L. method
            //added optional paramter to make POI symbols circles
            //added onFeature: onEachFeature here, so that I preserved the circle markers
            //and also called the onEachFeature function for info pop-ups
            L.geoJson(response, {onEachFeature: onEachFeature,
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(mymap);
        }
    });
};




//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = .0009;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};



//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, mymap){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "YR2012";

    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#72a393",
        color: "#4e7265",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add to map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            //step 5: determine value for selected attribute (for ea. feature)
            var attValue = Number(feature.properties[attribute]);

            //step 6: give ea. feature's circle marker a radius based on its att value
            geojsonMarkerOptions.radius = calcPropRadius(attValue)

            //create the circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(mymap);
};

//Step 2: Import GeoJSON data
function getData(mymap){
    //load data
    $.ajax("data/RefugeeDataMap.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, mymap);
        }
    });
};



function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "YR2012";

    //create marker options
    var options = {
        fillColor: "#72a393",
        color: "#4e7265",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>Country of Origin:</b> " + feature.properties.Country + "</p>";

    //add formatted attribute (year) to popup content string
    var year = attribute.split("YR");
    popupContent += "<p><b> Refugees in "+year+":</b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, mymap){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(mymap);
};

$(document).ready(createMap);
