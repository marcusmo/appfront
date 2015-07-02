var exampleApp = angular.module('appfront.examples',
	[ 'appfront.filters', 'appfront.form' ])

.config(function($modelServiceProvider) {
	$modelServiceProvider
	.type("$root", {
		required: "Du måste ange ett värde",
	})
	.type("email", {
		pattern: {
			exp: /^.+@.+\.\w{2,}$/,
			message: "The e-mail address is malformatted"
		}
	})
	.type("pnr", {
		pattern: {
			exp: /^\d{8}-\d{4}$/i,
			message: "Personnummer skall skrivas på formen YYYYMMDD-NNNN"
		}
	})
	.type("email.alt", {
		pattern: {
			message: "Personens epost kan inte vara blank"
		}
	})
	.type("firstName", {
		length: {
			min: {
				length: 4,
				message: "Name must be at least 4 characters"
			}
		},
		capitalize: {
			message: "Namnet måste börja med stor bokstav"
		}
	})
	.validator("capitalize", function(input, p) {
		if(input.length < 1)
			return null;
		if(input.substr(0,1) != input.substr(0,1).toUpperCase())
			return p.message;
	});
})

.controller('SampleController', function($scope, $modelService, $timeout, $http) {
	$scope.person = { name: "Test"};
	$scope.title = "Hello from angular";
	$scope.modelValid = true;

	$scope.$on("onModelValidation", function() {
		$scope.modelValid = $modelService.isModelValid("person");
	});




	$scope.longoperation = function(message) {
		if($modelService.validateModel("person")) {
			console.log("Starting work");
			return $timeout(function() {
				console.log("Done: " + message );
			}, 2000);	
		} else {
			$scope.title = "Check inputs and try again!";
		}
		
	}

	
});
