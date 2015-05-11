angular.module('appfront.filters', [])


	.filter('offset', function() {
	  return function(input, start) {
	  	if(input == null)
	  		return null;
	    start = parseInt(start, 10);
	    return input.slice(start);
	  };
	})

	.filter('customOrder', function() {
	  return function(input, property, flip) {
	  	if(property == null || property == "" || input.length == 0)
	  		return input;
	  	input = input.slice();
	  	var isNumeric = !isNaN(input[0][property]);
	    input.sort(function(a, b) {
	    	var aprop = a[property];
	    	var bprop = b[property];

	    	if(isNumeric) {
	    		aprop = parseFloat(aprop);
	    		bprop = parseFloat(bprop);
	    	}

	    	if(aprop < bprop)
	    		return -1;
	    	else if(aprop > bprop)
	    		return 1;
	    	else
	    		return 0;
	    })
	    if(flip)
	    	input.reverse();
	    return input;
	  };
	})

	.filter('sek', function() {
		return function(input) {


		if(input == null || input == "")	
			return null;
		
		var input = angular.copy(input);
		
		if(isNaN(input)) {
			input = input.replace(",", ".");
		}
		
		input = Math.round(input * 1);

		var s = new String(input / 1);

		var length = s.indexOf(".");

		if(length == -1)
			length = s.length;

		var count = 0;

		for(var i = length % 3; i < length; i += 3) {
			s = s.substr(0, i + count) + " " + s.substr(i + count);
			count++;
		}

		return s + " kr";

	}})

	.filter('nullnumber', function() {
		return function(input) {

			if(input == null)
				return 0;
			else
				return parseInt(input, 10);
		}
	})

	.filter('percent', function() {
		return function(input) {

			if(input == null)
				return "-";

			input = input.replace(",", ".")
			var decimal = parseFloat(input, 10);

			decimal = Math.round(decimal * 10000) / 100;

			return decimal + "%";

		}
	}).filter('pricing', function() {
		return function(input) {

			if(input == null)
				return "-";

			input = input.replace(",", ".")
			var decimal = parseFloat(input, 10);
			decimal = 1-decimal;
			decimal = Math.round(decimal * 10000) / 100;

			return decimal + "%";

		}
	})


	.filter('dateSort', function() {

		return function(input, column) {

			if(input == null)
				return;

			column = "@" + column;

			input.sort(function(a,b) {
				return a[column].localeCompare(b[column]);
			});

			return input;

		}
	})
	.filter('date', function() {

		return function(input) {
			if(input == null || input.length < 10)
				return "-"
			return input.substr(0,10);
			

		}



	})
	.filter('datestring', function() {

		return function(input) {
			if(input.length < 10)
				return null;

			var year = input.substr(0,4);
			var month = parseInt(input.substr(5,2), 10);
			var day = parseInt(input.substr(8,2), 10);

			var monthNames = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
			

			return "Den " + day + (day < 3 ? ":a " : ":e ") + monthNames[month-1] + " " + year;			

		}

	})
	.filter('booleanFilter',function(){
		return function(val) {
			if(typeof(val)==undefined || val===false) {
				return "Nej";
			} else {
				return "Ja";
			}
		}
	});