/* custom JavaScript file by Jasmin Becerra, 2017 */
//main.js for Leaflet Lab assignment


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

// //function to retrieve the data and place it on the map
// function getData(mymap, attributes){
//     //load the data
//     $.ajax("data/RefugeeDataMap.geojson", {
//         dataType: "json",
//         success: function(response){
//         	//create marker options (set POI symbols to circles)
//             var geojsonMarkerOptions = {
//                 radius: 8,
//                 fillColor: "#72a393",
//                 color: "#4e7265",
//                 weight: 1,
//                 opacity: 1,
//                 fillOpacity: 0.8
//             };


//             //added geoJSON data via a geoJSON layer using the L. method
//             //added optional paramter to make POI symbols circles
//             //added onFeature: onEachFeature here, so that I preserved the circle markers
//             //and also called the onEachFeature function for info pop-ups
//             L.geoJson(response, {onEachFeature: onEachFeature,
//                 pointToLayer: function (feature, latlng){
//                     return L.circleMarker(latlng, geojsonMarkerOptions);
//                 }
//             }).addTo(mymap);
//         }
//     });
// };



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


//Import GeoJSON data to create prop symbols
function getData(mymap, attributes){
    //load the data
    $.ajax("data/RefugeeDataMap.geojson", {
        dataType: "json",
        success: function(response){
            //call func to create prop symbols
            createPropSymbols(response, mymap);
        }
    });
};

function onEachFeature(feature, layer, attributes) {
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
function pointToLayer(feature, latlng, attributes){
    //assign attribute based on attribute index in array (starting attribute should be YR2000)
    var attribute = attributes[0];
    // // //console.log to check if it worked
    // console.log(attribute)
    // //checks out, YR2000 

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
    var popupContent = "<p><b>Country of Origin:</b> " + feature.properties.Country + "</p>";

    //add formatted attribute (year) to popup content string
    var year = attribute.split("YR")[0];
    // console.log(year)
    popupContent += "<p><b> Refugees in "+ year +":</b> " + feature.properties[attribute] + "</p>";


    // //bind the popup to the circle marker
    // layer.bindPopup(popupContent);

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
        // click: function(){
        //     $("#panel").html(panelContent);
        // }
        // I removed the click function so that only the widget is in the #panel
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
}

//Add circle markers for points to mymap
function createPropSymbols(data, mymap, attributes){
    //create a Leaflet GeoJSON layer and add to the map
    var featLayer = L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(mymap);
    searchOperator(data, featLayer);
};

function updatePropSymbols(mymap, attribute){
    mymap.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //get access to feature properties
            var props = layer.feature.properties;

            //update ea. feature's radius (base on attribute values)
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popop string
            var popupContent = "<p><b>Country of origin: </b>" + props.Country + "</p>";

            //add formatted attribute to panel string
            var year = attribute.split("YR")[1];
            popupContent += "<p><b>Refugees in " + year + ": </b>" + props[attribute] +"</p>";

            //update/replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0, -radius),
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
                // click: function(){
                //     $("#panel").html(panelContent);
                // }
                // I removed the click function so that only the widget is in the #panel
            });


        };

    });

};

//create new sequence controls
function createSequenceControls(mymap, attributes){
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

    //click listener for buttons
    $('.skip').click(function(){
        //getting the old index value
        var index = $('.range-slider').val();

        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute value, wrap back to the first
            // we have 16 attributes (0 to 15), so if the index is greater
            //than 15, we loop back to the first attribute (aka index 0)
            index = index >15 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //if past the first attribute, wrap back to the last
            index = index < 0 ? 15 : index;
        };

        //update slider
        $('.range-slider').val(index);

        //pass new attribute to update the prop. symbols
        updatePropSymbols(mymap, attributes[index]);
    });

    //input listener for slider
    $('.range-slider').on('input', function(){
        //get new index value
        var index = $(this).val();
        // console.log(index);
        // //index slider checks out!

        //pass new attribute to update the prop. symbols
        updatePropSymbols(mymap, attributes[index]);

    });

};

//build attribute array from refugee data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //first feature's properties
    var properties = data.features[0].properties;

    //push ea. attribute name into array
    for (var attribute in properties){
        //only take attributes with yearly # of refugee values
        if (attribute.indexOf("YR") > -1){
            attributes.push(attribute);
        };
    };
    // //console.log to check if array went through
    console.log(attributes);
    //looks good!

    return attributes;
};

function searchOperator(data, someLayer){
    var searchOp = new L.Control.Search({
        layer: someLayer,
        propertyName: 'Country',
        marker: false,
        zoom: 4,
        moveToLocation: function(latlng, title, mymap){
            if(this.options.zoom)
            
            this._map.setView(latlng, this.options.zoom);
        else
            this._map.panTo(latlng);
        }
    });


    searchOp.on('search:locationfound', function(e) {
        e.layer.setStyle({
            fillColor: '#e29a9a',
            color: '#cc6464'});

            if(e.layer._popup)
                e.layer.openPopup();
            
    }).on('search:collapsed', function(e){
            someLayer.eachLayer(function(layer){
                someLayer.resetStyle(layer);
            });
        });
    mymap.addControl(searchOp);

};

//Import GeoJSON data
function getData(mymap){
    //load data
    $.ajax("data/RefugeeDataMap.geojson", {
        dataType: "json",
        success: function(response){
            //create array for attributes (for sequencing purposes)
            var attributes = processData(response);

            //call function to create proportional symbols
            createPropSymbols(response, mymap, attributes);
            createSequenceControls(mymap, attributes);
            // REMEMBER: pass attributes as a paramter in previous functions
        }
    });
};


$(document).ready();

