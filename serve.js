const express = require('express')
const app = express()
const bodyParser = require('body-parser');
var request = require('request');
const path = require('path')
const appId = "9e5c34ab";
const appKey = "129dd1d62ed85119256fe5b414f1765b";
var flight_api_uri = "https://api.flightstats.com/flex/schedules/rest/v1/json";
var appendString = "?appId=" + appId + "&appKey=" + appKey;

app
	.use(bodyParser.json())       // to support JSON-encoded bodies
	.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  extended: true
	}))
	.use('/images', express.static(path.join(__dirname, '/images')))
	.use('/styles', express.static(path.join(__dirname, '/styles')))
	.use('/scripts', express.static(path.join(__dirname, '/scripts')))
    .get("/",function(req,res,next){
       res.sendFile(__dirname + "/index.html");
      //res.render("allbuckets",{"local_buckets": getLocalBucket()});
    })
    .get("flightAPIByFlightNm",function(req,res,next){
    	res.json({"test":"API ready"});
    })
    .post("flightAPIByFlightNm",function(req,res,next){
       //res.sendFile(__dirname + "/index.html");
      //res.render("allbuckets",{"local_buckets": getLocalBucket()});
      var queryString = req.body;
      var day = queryString.day;
      var month = queryString.month;
      var year = queryString.year;
      var carrier_flightnumber = queryString.carrier_flightnumber;
	  var patt = new RegExp("[a-zA-Z]{2}[0-9]{3}[a-zA-Z]?");
	  if(patt.test(carrier_flightnumber)){
		var requestUri = flight_api_uri + "/flight/" + carrier_flightnumber.substring(0,2) + "/" + carrier_flightnumber.substring(2)+ "/departing/" + year + "/" + month + "/" + day;
		requestUri += appendString;
		console.log(requestUri);
		request(requestUri, function (error, response, body) {
		  //console.log('error:', error); // Print the error if one occurred 
		 // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
		  //console.log('body:', body); // Print the HTML for the Google homepage. 
		  if(error) res.json({"error":error});
		  body = JSON.parse(body); 
		  if(body.scheduledFlights.length){
		  	var returnObj = {
		  		"departureTime": body.scheduledFlights[0].departureTime,
		  		"arrivalTime": body.scheduledFlights[0].arrivalTime,
		  		"departureAirportFsCode": body.scheduledFlights[0].departureAirportFsCode,
		  		"arrivalAirportFsCode": body.scheduledFlights[0].arrivalAirportFsCode
		  	}
		  	res.json({"payload":returnObj});
		  }else{
		  	res.json({"error":"No suggested Deporture and Arrival Time"});
		  }

		})

	  }else{
	  	res.json({"error":"Please enter correct info"});
	  }
    })
    .post("flightAPIByRoute",function(req,res,next){
		var queryString = req.body;
		var day = queryString.day;
		var month = queryString.month;
		var year = queryString.year;
		var departure_airport = queryString.departure_airport;
		var arrival_airport = queryString.arrival_airport;
		var requestUri = flight_api_uri + "/from/" + departure_airport + "/to/" + arrival_airport + "/departing/" + year + "/" + month + "/" + day;
		requestUri += appendString;
		request(requestUri, function (error, response, body) {
		  if(error) res.json({"error":error});
		  body = JSON.parse(body); 
		  if(body.scheduledFlights.length){
		  	res.json({"payload":body.scheduledFlights});
		  }else{
		  	res.json({"error":"No suggested Flight Route"});
		  }
		});
    })
	.listen(process.env.PORT || 3002);
