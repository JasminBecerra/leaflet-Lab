/* custom JavaScript file by Jasmin Becerra, 2017 */

//initialize onMapClick
function initialize(){
    onMapClick();
};

//link mymap variable to mapid in index, 
//set view is used to set up a deafult center and zoom level
//I decided to change the zoom level to 2 (and not as the tutorial's deafult)
var mymap = L.map('mapid').setView([40, -50], 2);

//link to tileset (using mapbox +open street map)
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.light'
    }).addTo(mymap);
//adds to mapid div

//marker added to the map
var marker = L.marker([51.5, -0.09]).addTo(mymap);

//circle added to the map
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

//polygon added to map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

//pop ups will appear if items clicked
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//pop-ups
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);

var popup = L.popup();

//designates how the pop ups function-- anytime you click on the map, a
//pop up will appear telling the user that they've clicked the map @ a certain LatLng
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

//click method on map
mymap.on('click', onMapClick);



//SECOND TUTORIAL


//adding features to map (Denver area)
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//adds feature layer to the map
L.geoJSON(geojsonFeature).addTo(mymap);

//adds lines
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

//adds them to the actual map
L.geoJSON(myLines).addTo(mymap);

//empty layer , we can add features later
var myLayer = L.geoJSON().addTo(mymap);
myLayer.addData(geojsonFeature);

//setting up a "myLines" variable
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];
//stylizes lines (all)
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};
//adds stylized lines to map
L.geoJSON(myLines, {
    style: myStyle
}).addTo(mymap);

//stylizing features individually (as opposed to how we stylized all lines above)
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];
//stylizing democrat + republican separately/different colors
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(mymap);

//point markers using pointToLayer method (this is a circle)
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};


//can replace 'states' with any other GeoJSON feature, this is just the one I tested
L.geoJSON(states, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(mymap);


//fucntion calls feature before adding it to the layer
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}
//GeoJSON feature that is to be called
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//exectues onEachFeature method
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(mymap);


//Filters: the filter option controls visibility of GeoJSON features
//so the "Coors Field" feature will be visible, while "Busch Field" will not
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_mymap": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

//GeoJSON object added to 'mymap' via the geoJSON layer
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_mymap;
    }
}).addTo(mymap);

//call the initialize function when the window has loaded
window.onload = initialize();

