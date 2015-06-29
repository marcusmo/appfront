var exampleApp = angular.module('appfront.examples',
	[ 'appfront.filters', 'appfront.form.directives' ])

.controller('SampleController', function($scope) {
	$scope.title = "Hello from angular";
});
