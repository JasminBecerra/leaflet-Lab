/* custom JavaScript file by Jasmin Becerra, 2017 */
//main.js for Leaflet Lab assignment

//function to initialize the Leaflet map
function createMap(){
    //create the map linked to div id 'mapid' from index.html
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


//Add circle markers for point features to the map
function createPropSymbols(data, mymap){
    //Determine which attribute to visualize with proportional symbols (year 2012)
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
            //determine value for selected attribute (for ea. feature)
            var attValue = Number(feature.properties[attribute]);

            //give ea. feature's circle marker a radius based on its att value
            geojsonMarkerOptions.radius = calcPropRadius(attValue)

            //create the circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(mymap);
};

//Import GeoJSON data to create prop symbols
function getData(mymap){
    //load the data
    $.ajax("data/RefugeeDataMap.geojson", {
        dataType: "json",
        success: function(response){
            //call func to create prop symbols
            createPropSymbols(response, mymap);
        }
    });
};

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with properties
    //empty variable first
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to convert markers to circles
function pointToLayer(feature, latlng){
    //Determine which attribute (year 2012) to visualize with proportional symbols
    var attribute = "YR2012";

    //create marker options
    var options = {
        fillColor: "#72a393",
        color: "#4e7265",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string for country of origin
    var panelContent = "<p><b>Country of Origin:</b> " + feature.properties.Country + "</p>";

    //add formatted attribute (year) to popup content string
    var year = attribute.split("YR")[1];
    // console.log(year)
    panelContent += "<p><b> Refugees in "+year+":</b> " + feature.properties[attribute] + "</p>";

    //popup content is now just Country of Origin
    var popupContent = feature.properties.Country;

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //bind popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
        closeButton: false 
    });

    //event listeners to open popup on hover/mouseover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#panel").html(panelContent);
        }
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for points to mymap
function createPropSymbols(data, mymap){
    //create a Leaflet GeoJSON layer and add to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(mymap);
};

//create new sequence controls
function createSequenceControls(mymap){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    //set slider attributes
    
    $('.range-slider').attr({
        max: 15,
        min: 0,
        value: 0,
        step: 1
});
    //adding skip buttons, reverseand forward as "<<" and ">>" for simplicity
    $('#panel').append('<button class="skip" id="reverse"><<</button>');
    $('#panel').append('<button class="skip" id="forward">>></button>');
};

//Import GeoJSON data
function getData(mymap){
    //load data
    $.ajax("data/RefugeeDataMap.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, mymap);
            createSequenceControls(mymap);
        }
    });
};


$(document).ready(createMap);

