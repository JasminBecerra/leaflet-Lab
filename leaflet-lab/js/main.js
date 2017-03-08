/* custom JavaScript file by Jasmin Becerra, 2017 */
//main.js for Leaflet Lab assignment


    //create the map linked to div id 'mapid' from index.html
    var mymap = L.map('mapid', {
        center: [20, 10],
        zoom: 3
    });

    //add base tilelayer (from mapbox + open street map)
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamFzbWluYmVjIiwiYSI6ImNpdXlobG1raDA1MTAybmxnOXRhbTEwaW8ifQ.my00Kwcjtd9QoxJrA3sETA', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.light'
    }).addTo(mymap);

    //call getData function (defined at very bottom bottom)
    getData(mymap);


//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = .001;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
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

                layer.on({
                mouseover: function(){
                    this.openPopup();
                },
                mouseout:function(){
                    this.closePopup();
                }
            });
    

    createPopup(feature.properties, attribute, layer, options.radius);

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

            var year = attribute.split("YR")[1];

            layer.on({
                mouseover: function(){
                    this.openPopup();
                },
                mouseout:function(){
                    this.closePopup();
                }
            });


            createPopup(props, attribute, layer, radius)

        };
    });
    createLegend(mymap, attributes);
    updateLegend(mymap, attributes);

};

//function to create popups (and pass through pointToLayer and updatePropSymbols)
function createPopup(properties, attribute, layer, radius){
    //add country to popup content
    var popupContent = "<p><b>Country of Origin: </b>" + properties.Country + "</p>";

    //add attribute
    var year = attribute.split("YR")[1];

    popupContent += "<p><b> Refugees in " + year + ": </b>" + properties[attribute] + "</p>";

    //replace popup layer
    layer.bindPopup(popupContent,{
        offset: new L.Point(0, -radius)
    });
};

//create new sequence controls
function createSequenceControls(mymap, attributes){
    var SeqControl = L.Control.extend({
            options:{
                position: 'bottomleft'
            },

            onAdd: function(mymap){
                //make control container div + give it a class name
                var container = L.DomUtil.create('div', 'sequence-control-container');

                // slider or range input element and skip (<< and >>) buttons
                $(container).append('<input class="range-slider" type="range">');
                $(container).append('<button class="skip" id="reverse" title="Reverse"><<</button>');
                $(container).append('<button class="skip" id="forward" title="Forward">>></button>');

                //kill mouse event listeners
                $(container).on('mousedown db;click', function(e){
                    L.DomEvent.stopPropagation(e);
                });

                return container;
            }
        });
    mymap.addControl(new SeqControl());

    // //create range input element (slider)
    // $('#panel').append('<input class="range-slider" type="range">');
   
    //set range slider attributes
    $('.range-slider').attr({
        max: 15,
        min: 0,
        value: 0,
        step: 1
});
    // //adding skip buttons, reverseand forward as "<<" and ">>" for simplicity
    // $('#panel').append('<button class="skip" id="reverse"><<</button>');
    // $('#panel').append('<button class="skip" id="forward">>></button>');

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

function createLegend(mymap, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (mymap) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

                //inserting label on the legend
            $(container).append('<div id ="dynamic-legend"><b>Refugees in ' + attributes[0].split("YR")[1] +"</b></div>");

            //step 1: starting attr legend svg string
            var svg = '<svg id="temporal-legend" width="180px" height="180px">';

            //array of circle names for loop
            var circles = ["max", "mean", "min"];

            //step 2: loop to add ea. circle and txt to svg string
            for (var i=0; i<circles.length; i++){
                //circle string
                svg+= '<circle class="legend-circle" id=' + circles[i] +
                '" fill="#72a393" fill-opacity="0.8" stroke="#4f7265" cx="90"/>';
            };

            //close the string
            svg += "</svg>";


            //add attr legend svg to the container
            $(container).append(svg);


            return container;
        }
    });

    mymap.addControl(new LegendControl());
    updateLegend(mymap, attributes[0]);
};

//update legend as user changes year
function updateLegend(mymap, attribute){
    //create content for legend
    var year = attribute.split("YR")[1];
    var content = "Refugees in" + year;

    //replace the content in the legend with the new stuff
    $('#temporal-legend').html(content);

    //get mean, max, min vals as object
    var circleValues = getCircleValues(mymap, attribute);

    for (var key in circleValues){
        //get radius
        var radius = calcPropRadius(circleValues[key]);

        //ste 3-- assign the cy (center y coord) and r (radius) attributes
        $('#'+key).attr({
            cy: 179 - radius,
            r: radius
        });
    };

};

//function to calculate the mean, max, and min values for attributes
function getCircleValues(mymap, attribute){
    //start with min at highest poss, and max at lowest poss number
    var min = Infinity,
    max = -Infinity;

    mymap.eachLayer(function(layer){
        //get att value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for minimum
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for maximum
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });
    //set the mean/average
    var mean = (max + min)/2;

    //return vals as object
    return{
        max: max,
        mean: mean,
        min: min
    };
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
            createLegend(mymap, attributes);
            // REMEMBER: pass attributes as a paramter in previous functions
        }
    });
};


$(document).ready();

