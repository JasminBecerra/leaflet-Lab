// ajax
function initialize(){
	

};

//demo of AJAX using plain javascript
function jsAjax(){
	console.log("jsAjax")
	// to make sure everythign is being called, 
	// delete 8-10 once you do the console thing
function jsQuery(){}
	//initiate an ajax request object
	var ajaxRequest = new XMLHttpRequest();
	// call it as if you were calling a function, using the 'new' keywoard, case sensitive
	console.log(ajaxRequest);
	// you should see XHMLHttpRequest, with properties onabort onerror, onload, etc events
	//onreadstatechange is what we're going to access
	//they're all null right now
	//readystate is set to 0 at the moment

	//create an event handler for the request
	ajaxRequest.onreadystatechange = function(){
		console.log(ajaxRequest.readystate);
		if (ajaxRequest.readyState==4){
			console.log(ajaxRequest.response);
			//call a callback function and pass the data to it
			jsCallback(ajaxRequest.response);
			//looks like an object, but a string
			//we don't want text, we want a json object

		};


	};

	//open ajax request
	ajaxRequest.open('Get', 'data/MegaCities.geojson', true);
		//get vs post, post is a little more versatile, but get will do here
		// the true argument is whether or not you want it to be asyncronous
		// do you want it to execute out of line with the rest of the code?
		// that's what ajax is really for, so it'll typically always be true

	//set the data type
	ajaxRequest.responseType = 'json';

	// send the call
	ajaxRequest.send();

	//the console.log should have 1 2 3 4


};


function jsCallback(data){
	console.log(data);
	//shoould give you the same thing
	//create a new paragraph element for data on page
	var htmlString = "<h3>JavaSCript AJAX response text:</h3>";
	//concatanate/add data 
	htmlString += JSON.stringify(data);
	//^ has to be a string
	var p = document.createElement("p");
	p.innerHTML = htmlString;
	document.getElementByID("mydiv").appendChild(p);
	//^ check the webpage
	// what we want, is to add the data under what's on there


}; //why was there no semicolon here?

//ajax using jquery
function jQueryAjax(){
	$.ajax("data/MegaCities.geojson", {
		dataType: "json",
		success: jqueryCallback

	});
};


function jQueryCallback(data){
	var htmlString = "<h3>jQuery AJAX response text</h3>";
	htmlString += JSON.stringify(data);
	$("#mydiv").append("<p"+htmlString+"</p>")

}

window.onlad = initialize;

