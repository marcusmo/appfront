angular.module('appfront.form.ui.directives', ['ui.bootstrap'])

.directive('afDateAddonButton', function() {
	return {
		restrict: 'A',
		scope: {
			hasfocus: "&hasfocus",
			model: "&model",
			helper: "&helper"

		},
		template: '<a ng-click="open();" class="input-group-addon" ng-class="{\'input-group-addon-active\': $parent.helper.isopen}">' +
					'<span class="fa fa-calendar"></span>' +
				  '</a>',
		replace: true,
		
		link: function(scope, elem, attr, controller, transcludeFn) {
			scope.open = function() {
				scope.$parent.helper.isopen = !scope.$parent.helper.isopen;
			}
		}
	};		
})
.directive('afDateAddonPanel', function() {
	return {
		restrict: 'A',
		scope: {
			
		},
		template: '<div ng-class="{visible: $parent.helper.isopen}" datepicker ng-model="model" min-date="minDate" show-weeks="false" class="material-date" starting-day="1"></div>',
		replace: false,
		
		link: function(scope, elem, attr, controller, transcludeFn) {
			scope.model = "";

			function pad(number) {
				var r = String(number);
				if (r.length === 1) {
					r = '0' + r;
				}
				return r;
			}
			var formatDate = function(date) {
				return date.getFullYear()
					+ '-' + pad( date.getMonth() + 1 )
					+ '-' + pad( date.getDate() );
			}
			scope.$parent.$watch("hasfocus", function() {
				scope.$parent.helper.isopen = true;
			});

			scope.$parent.$watch("model", function() {
				scope.model = scope.$parent.model;
				
			});
			scope.$watch("model", function() {
				if( scope.model != null && scope.model.getFullYear)
					scope.$parent.model = formatDate(scope.model);
				scope.$parent.helper.isopen = false;
			});

		}
	};		
})