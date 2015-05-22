angular.module('appfront.form.directives', []).
	directive('afInputText', function() {
	return {
		restrict: 'A',
		scope: {
			title: "@afTitle",
			placeholder: "@afPlaceholder",
			model: "=afModel",
			pattern: "@afPattern",
			patternError: "@afPatternError",
			minlength: "@afMinLength",
			floatingTitle: "@afFloatingTitle",
			icon: "@afIcon",
			disabled: "=afDisabled",
			inputType: "@afInputType",
			class: "@afClass"
			
		},
		template: '<div class="material-input {{class}}" ng-class="{icon: icon, disabled: disabled}" >' +
					'<span ng-if="icon" class="fa fa-{{icon}} fa-lg material-icon"/>' +
					'<div class="form-group form-group-material" ng-class="{ focus: hasfocus, error: haserror, floatingtitle: floatingTitle, hasvalue: model > 0 || model.length > 0}">' +
					'<label>{{ title }}</label>' +
					'<div class="input-group">' +
						'<input class="form-control" type="{{inputType}}" ng-model="model" placeholder="{{ placeholderWrapper }}" ng-focus="focus();" ng-blur="blur();" ng-disabled="disabled"></input>' +
					'</div>' +
					'<div class="input-underline"></div>' + 
					'<div class="input-underline input-underline-focus"></div>' + 
					'<span ng-if="error.minlength" class="input-subtext input-error"><span ng-if="haserror" class="fa fa-exclamation-triangle"></span> Värdet är för kort</span>' + 
					'<span ng-if="error.pattern" class="input-subtext input-error"><span ng-if="haserror" class="fa fa-exclamation-triangle"></span> {{ patternError }}</span>' + 
				'</div></div>',
		replace: true,
		transclude: true,
		link: function(scope, elem, attr, controller, transcludeFn) {

			transcludeFn( scope, function( content ) {
                var parent = elem.find('div.input-group');
                parent.append(content);
            });
			scope.helper = {
				isopen: false
			};
			scope.hasfocus = false;
			scope.haserror = false;
			scope.isedited = false;
			scope.error = {
				minlength: false,
				maxlength: false,
				pattern: false,
			}
			scope.placeholderWrapper = scope.floatingTitle ? "" : scope.placeholder;
			if(!scope.inputType)
				scope.inputType = "text";
			
			scope.$watch("model", function() {	
				scope.validate();
			});

			scope.evaluateState = function() {
				if(scope.model == null || scope.floatingTitle && scope.model.length == 0 && scope.hasfocus || !scope.floatingTitle)
					scope.placeholderWrapper = scope.placeholder;
				else 
					scope.placeholderWrapper = "";
			}

			scope.focus = function() {
				scope.hasfocus = true;
			}
			scope.blur = function() {
				scope.hasfocus = false;
				scope.isedited = true;
				scope.validate();
			}
			scope.validate = function() {
				if(scope.model == null)
					return;
				
				if(scope.minlength != null) {
					var ml = parseInt(scope.minlength);
					if(scope.model.length < ml && scope.model.length > 0) {
						scope.error.minlength = true;
					} else {
						scope.error.minlength = false;
					}
				}
				if(scope.pattern != null) {
					var re = new RegExp(scope.pattern);
					if(scope.model.length > 0 && !re.test(scope.model)) {
						scope.error.pattern = true;
					} else {
						scope.error.pattern = false;
					}
				}

				scope.haserror = scope.isedited && (scope.error.minlength || scope.error.maxlength || scope.error.pattern);
			}
		}
	};		
}).directive('afCheckbox', function() {
	return {
		restrict: 'A',
		scope: {
			title: "@afTitle",
			class: "@afClass",
			model: "=afModel",
			value: "@afValue",
			icon: "@afIcon",
			mode: "@afMode",
			modelParent: "=afModelParent",
			modelName: "@afModelName"
		},
		template: '<div class="material-input material-input-checkbox {{ class }}" ng-class="{checked: isChecked()}" ng-click="toggle();">' +
					 '<label>{{ title }}</label>' +
					 '<div class="material-checkbox-ink"></div>' +
					 '<div class="material-checkbox-box">' +
					 '<div class="material-checkbox-check"></div>' +
					 '</div>' +
				   '</div>',
		replace: true,
		link: function(scope, elem, attr, controller) {
			
			scope.$watch("model", function() {
				
			});

			scope.toggle = function() {
				if(scope.value) {
					if(!scope.isChecked())
						scope.model = scope.value;
					else if(scope.mode == "delete")
						delete scope.modelParent[scope.modelName];
				} else {
					if(scope.model)
						scope.model = false;
					else
						scope.model = true;	
				}
				
			}
			scope.isChecked = function() {
				if(scope.value)
					return scope.model == scope.value;
				return scope.model != null && scope.model == true;
			}
		}
	};		
}).directive('afPaginatedTable', function() {
	return {
		restrict: 'A',
		scope: {
			objects: "=afObjects",
			pageSize: "@afPageSize",
		},
		template: '<table>' +
					 '<tfoot class="text-center"><tr><td colspan="100">' +
					 	'<a ng-click="prevPage();">Föregående sida</a> | ' +
					 	'<a ng-click="nextPage();">Nästa sida</a>' +
					  '</td></tr></tfoot>' +
				  '</table>',
		//replace: true,
		transclude: true,
	    link: function(scope, elem, attr, controller, transcludeFn) {
			
			transcludeFn( scope, function( content ) {
                elem.prepend( content );
            });

			scope.selection = [];
			scope.sort = {
				field: null,
				ascending: true
			};
			scope.currentPage = 0;
			scope.page = [];
			scope.resort = function() {
				if(scope.selection == null)
					return;
				if(scope.sort.field == null)
					scope.selection.sort();
				else {
					scope.selection.sort(
						function(a, b) {
							if(a[scope.sort.field] > b[scope.sort.field])
								return scope.sort.ascending ? 1 : -1;
							else if(a[scope.sort.field] < b[scope.sort.field])
								return scope.sort.ascending ? -1 : 1;
							else
								return 0;
						}
					);
				}
				scope.currentPage = 0;
				scope.repage();
			}

			scope.repage = function() {
				if(scope.selection == null)
					return;
				var lb = scope.currentPage * scope.pageSize;
				var ub = (scope.currentPage + 1) * scope.pageSize;
				if(ub >= scope.selection.length)
					ub = scope.selection.length;
				
				if(lb > scope.selection.length) {
					scope.currentPage--;
					return scope.repage();
				}
				

				scope.page = scope.selection.slice(lb, ub);
			}
			scope.nextPage = function() {
				scope.currentPage++;
				scope.repage();
			}
			scope.prevPage = function() {
				if(scope.currentPage == 0)
					return;
				scope.currentPage--;
				scope.repage();
			}


			scope.$watch("objects", function() {
				scope.selection = angular.copy(scope.objects);
				scope.repage();
			});
			scope.$watch("sort", function() {
				scope.resort();
			});




		}
	};		
}).directive('afTableHeader', function() {
	return {
		restrict: 'A',
		scope: {
			field: "@afField",
		},
		template: '<a ng-click="dosort();"><span ng-transclude></span> {{ arrow }}<a>',
		transclude: true,
		replace: false,
	    link: function(scope, elem, attr, controller, transcludeFn) {
			
			var dir_up = "\u25b2";
			var dir_down = "\u25bC";
			scope.arrow = " ";
			scope.$parent.$watch("sort", function(val) {
				if(val == null)
					return;
				if(val.field == scope.field) {
					scope.arrow = val.ascending ? dir_up : dir_down;
				} else {
					scope.arrow = " ";
				}

			}, true);

			scope.dosort = function() {
				var sort = scope.$parent.sort;
				if(sort.field == scope.field)
					sort.ascending = !sort.ascending;
				else {
					sort.field = scope.field;
					sort.ascending = true;
				}
				scope.$parent.resort();
			}
		}
	};		
}).directive('afReversibleCard', function() {
	return {
		restrict: 'A',
		template: '<div class="reversible-container">' +
			'<div class="reversible-flipper {{afClass}}" ng-class="{\'reversible-flipper-flipped\': isFlipped}" style="transform-style: preserve-3d;">' +
			'<div ng-transclude></div></div>',
		replace: true,
		transclude: true,
		scope: {
			"afClass": "@",
		},
	    link: function(scope, elem, attr, controller, transcludeFn) {
	    	//transcludeFn( scope, function( content ) {
                
              //  elem.find("div.reversible-flipper").append( content );
            //});
	    	scope.isFlipped = false;
			scope.flip = function() {
				scope.isFlipped = !scope.isFlipped;
			}
		}
	};
});