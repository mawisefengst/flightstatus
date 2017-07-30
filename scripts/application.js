function getClockTime(dateObj){
   if(typeof dateObj.getHours == "undefined") 	dateObj = new Date(dateObj);
   var hour   = dateObj.getHours();
   var minute = dateObj.getMinutes();
   var second = dateObj.getSeconds();
   var ap = "AM";
   if (hour   > 11) { ap = "PM";             }
   if (hour   > 12) { hour = hour - 12;      }
   if (hour   == 0) { hour = 12;             }
   if (hour   < 10) { hour   = "0" + hour;   }
   if (minute < 10) { minute = "0" + minute; }
   if (second < 10) { second = "0" + second; }
   var timeString = hour + ':' + minute + ':' + second + " " + ap;
   return timeString;
}

function initAutoComplete(inputId){
	 var options = {
		  shouldSort: true,
		  threshold: 0.4,
		  maxPatternLength: 32,
		  keys: [{
		    name: 'iata',
		    weight: 0.5
		  }, {
		    name: 'name',
		    weight: 0.3
		  }, {
		    name: 'city',
		    weight: 0.2
		  }]
	};

	var fuse = new Fuse(airports, options)

	var ac = $('#'+ inputId)
	  .on('click', function(e) {
	    e.stopPropagation();
	  })
	  .on('focus keyup', search)
	  .on('keydown', onKeyDown);

	var wrap = $('<div>')
	  .addClass('autocomplete-wrapper')
	  .insertBefore(ac)
	  .append(ac);

	var list = $('<div>')
	  .addClass('autocomplete-results')
	  .on('click', '.autocomplete-result', function(e) {
	    e.preventDefault();
	    e.stopPropagation();
	    selectIndex($(this).data('index'));
	  })
	  .appendTo(wrap);

	$(document)
	  .on('mouseover', '.autocomplete-result', function(e) {
	    var index = parseInt($(this).data('index'), 10);
	    if (!isNaN(index)) {
	      list.attr('data-highlight', index);
	    }
	  })
	  .on('click', clearResults);

	function clearResults() {
	  results = [];
	  numResults = 0;
	  list.empty();
	}

	function selectIndex(index) {
	  if (results.length >= index + 1) {
	    ac.val(results[index].iata);
	    clearResults();
	  }  
	}

	var results = [];
	var numResults = 0;
	var selectedIndex = -1;

	function search(e) {
	  if (e.which === 38 || e.which === 13 || e.which === 40) {
	    return;
	  }
	  
	  if (ac.val().length > 0) {
	    results = _.take(fuse.search(ac.val()), 7);
	    numResults = results.length;
	    
	    var divs = results.map(function(r, i) {
	        return '<div class="autocomplete-result" data-index="'+ i +'">'
	             + '<div><b>'+ r.iata +'</b> - '+ r.name +'</div>'
	             + '<div class="autocomplete-location">'+ r.city +', '+ r.country +'</div>'
	             + '</div>';
	     });
	    
	    selectedIndex = -1;
	    list.html(divs.join(''))
	      .attr('data-highlight', selectedIndex);

	  } else {
	    numResults = 0;
	    list.empty();
	  }
	}

	function onKeyDown(e) {
	  switch(e.which) {
	    case 38: // up
	      selectedIndex--;
	      if (selectedIndex <= -1) {
	        selectedIndex = -1;
	      }
	      list.attr('data-highlight', selectedIndex);
	      break;
	    case 13: // enter
	      selectIndex(selectedIndex);
	      break;
	    case 9: // enter
	      selectIndex(selectedIndex);
	      e.stopPropagation();
	      return;
	    case 40: // down
	      selectedIndex++;
	      if (selectedIndex >= numResults) {
	        selectedIndex = numResults-1;
	      }
	      list.attr('data-highlight', selectedIndex);
	      break;

	    default: return; // exit this handler for other keys
	  }
	  e.stopPropagation();
	  e.preventDefault(); // prevent the default action (scroll / move caret)
	}
}

function initResult(inputId,results){

	var ac = $('#'+ inputId);

	function selectIndex(index) {
	  if (results.length >= index + 1) {
	    ac.val(results[index].carrierFsCode + results[index].flightNumber);
	    clearResults();
	  }  
	}

	var wrap = $('<div>')
	  .addClass('autocomplete-wrapper')
	  .insertBefore(ac)
	  .append(ac);

	var list = $('<div>')
	  .addClass('autocomplete-results')
	  .on('click', '.autocomplete-result', function(e) {
	    e.preventDefault();
	    e.stopPropagation();
	    selectIndex($(this).data('index'));
	  })
	  .appendTo(wrap);


	 var divs = results.map(function(r, i) {
        return '<div class="autocomplete-result" data-index="'+ i +'">'
             + '<div><b>'+ r.carrierFsCode + r.flightNumber +'</b> </div>'
             + '<div class="autocomplete-location">Depart Time: '+ getClockTime(r.departureTime) +'</div>'
             + '<div class="autocomplete-location">Arrival Time: '+ getClockTime(r.arrivalTime) +'</div>'
             + '</div>';
     });  

     list.html(divs.join(''));

	function clearResults() {
	  ac.data("result",results);
	  results = [];
	  numResults = 0;
	  list.empty();
	} 
}

jQuery(document).ready(function($) {	

	initAutoComplete("departure_airport");

	initAutoComplete("arrival_airport");


	$(".datepickerField").datepicker({
	    changeYear: true,
	    yearRange: '1913:2117', 
		constrainInput: true, // Makes sure only dates can be entered
		//showOn: "button",
		// buttonImage: "i/calendar.gif",
		// buttonImageOnly: true,
		//dateFormat: "yy-mm-dd", // Format of date
		showOn: "both",
		buttonImage: "images/calendar.png",
		buttonImageOnly: true,
		dateFormat: "mm/dd/yy", // Format of date
		showAnim: "blind",	// goofy and wholly unnecessary special effects
		autoSize: true	// overrides any other size to make this field date-length; we may not want this
	}); 



	$("#datepickerField").on("change",function(e){
		//console.log(e.currentTarget.value);
		var dateString = new Date(e.currentTarget.value);
		var carrier_flightnumber = $("#carrier_flightnumber").val()
		if(carrier_flightnumber.length){
			var payload = {
				"year":dateString.getFullYear(),
				"month":dateString.getMonth() + 1,
				"day":dateString.getDate(),
				"carrier_flightnumber": carrier_flightnumber
			};
			$.ajax({
			    type: "POST",
			    url: "flightAPIByFlightNm",
			    data: payload,
			    dataType: "json"
		    }).done(function(resp) {
		    	if(typeof resp.error != "undefined") console.log(resp.error);
		   		else{
		   			var arrivaltime = new Date(resp.payload.arrivalTime);
		   			$("#arrivalTime").val(getClockTime(arrivaltime));
		   			var departureTime = new Date(resp.payload.departureTime);
		   			$("#departureTime").val(getClockTime(departureTime));
		   			$("#departureAirport").val(resp.payload.departureAirportFsCode);
		   			$("#arrivalAirport").val(resp.payload.arrivalAirportFsCode);
		   		}
		    }).fail(function(resp) {
		  	  	console.log("An error occurred.")
		  	});
		}
	});

	$("#flightDate").on("change",function(e){
		//console.log(e.currentTarget.value);
		var dateString = new Date(e.currentTarget.value);
		var departure_airport = $("#departure_airport").val();
		var arrival_airport = $("#arrival_airport").val()
		if(departure_airport.length && arrival_airport.length){
			var payload = {
				"year":dateString.getFullYear(),
				"month":dateString.getMonth() + 1,
				"day":dateString.getDate(),
				"departure_airport": departure_airport,
				"arrival_airport":arrival_airport
			};
			$.ajax({
			    type: "POST",
			    url: "flightAPIByRoute",
			    data: payload,
			    dataType: "json"
		    }).done(function(resp) {
		    	if(typeof resp.error != "undefined") console.log(resp.error);
		   		else{
		   			if(resp.payload.length > 1){
		   				initResult("flightnumber",resp.payload);
		   			}else if(resp.payload.length == 1){
		   				$("#carrier_flightnumber").val(resp.payload[0].carrierFsCode + resp.payload[0].flightNumber)
		   			}else{
	   					console.log("No flight founded")
		   			}
		   			/*var arrivaltime = new Date(resp.payload.arrivalTime);
		   			$("#arrivalTime").val(getClockTime(arrivaltime));
		   			var departureTime = new Date(resp.payload.departureTime);
		   			$("#departureTime").val(getClockTime(departureTime));
		   			$("#departureAirport").val(resp.payload.departureAirportFsCode);
		   			$("#arrivalAirport").val(resp.payload.arrivalAirportFsCode);*/
		   		}
		    }).fail(function(resp) {
		  	  	console.log("An error occurred.")
		  	});
		}else{
			alert("Please enter departure airport and arrival airport to poputlate flight number")
		}
	});



});	 