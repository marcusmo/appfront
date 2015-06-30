angular.module('appfront.form', [])
	.directive('afInputText', function($modelService) {
	return {
		restrict: 'A',
		scope: {
			title: "@afTitle",
			placeholder: "@afPlaceholder",
			model: "=afModel",
			minlength: "@afMinLength",
			floatingTitle: "@afFloatingTitle",
			icon: "@afIcon",
			disabled: "=afDisabled",
			inputType: "@afInputType",
			class: "@afClass",
			isRequired: "@afRequired",
			dataType: "@afType",
			
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
					'<span ng-if="haserror" class="input-subtext input-error"><span ng-if="haserror" class="fa fa-exclamation-triangle"></span> {{ error }}</span>' + 
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

			findValidationModel = function() {
				if(elem.attr("af-validation-model") != null)
					return elem.attr("af-validation-model");
				var searchElement = elem.parent("[@af-validation-model]");
				if(searchElement != null)
					return searchElement.attr("af-validation-model");
				return null;
			}

			scope.validationModel = findValidationModel();

			
			
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
				
				if(scope.dataType == null) 
					return;

				scope.error = $modelService.validate(scope.dataType, scope.model, scope.isRequired != null && scope.isRequired == "true");
				
				if(scope.validationModel != null)
					$modelService.report(scope.validationModel, "fld_" + scope.$id, scope.error);
				
				scope.haserror = scope.isedited && scope.error != null;

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
			modelName: "@afModelName",
			disabled: "=afDisabled"
		},
		template: '<div class="material-input material-input-checkbox {{ class }}" ng-class="{checked: isChecked(), \'input-disabled\': (disabled == true)}" ng-click="toggle();">' +
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
				if(scope.disabled == true)
					return;
				if(scope.value) {
					if(!scope.isChecked())
						scope.model = scope.value;
					else if(scope.mode == "delete") {
						if(!scope.modelParent || !scope.modelName)
							throw "Must set af-model-parent and af-model-name on checkbox with mode 'delete'";
						delete scope.modelParent[scope.modelName];
					}
				} else {
					if(scope.mode == "clear") {
						if(scope.model)
							delete scope.modelParent[scope.modelName];
					} else {
						if(scope.model)
							scope.model = false;
						else
							scope.model = true;	
					}
				}
				
			}
			scope.isChecked = function() {
				if(scope.value)
					return scope.model == scope.value;
				if(scope.mode == "clear")
					return scope.model == null;
				
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
					 	'<a ng-click="prevPage();">F�reg�ende sida</a> | ' +
					 	'<a ng-click="nextPage();">N�sta sida</a>' +
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
			scope.isFlipped = false;
			scope.flip = function() {
				scope.isFlipped = !scope.isFlipped;
			}
		}
	};
})

.directive('afModelIsValid', function($modelService) {
	return {
		restrict: 'A',
		scope: { "modelName": "@afModelIsValid" },
		link: function(scope, elem, attr, controller) {
			scope.$on("onModelValidation", function() {
				var valid = $modelService.isModelValid(scope.modelName);
				if(valid) 
					elem.css('display', '');
				else 
					elem.css('display', 'none');
			});
		}
	}
})

.directive('afModelIsNotValid', function($modelService) {
	return {
		restrict: 'A',
		scope: { "modelName": "@afModelIsNotValid" },
		link: function(scope, elem, attr, controller) {
			scope.$on("onModelValidation", function() {
				var valid = $modelService.isModelValid(scope.modelName);
				if(!valid) 
					elem.css('display', '');
				else 
					elem.css('display', 'none');
			});
		}
	}
})

.directive('afClick', function($parse, $rootScope) {
	return {
		restrict: 'A',
		compile: function($element, attr) {

			var fn = $parse(attr["afClick"], /* interceptorFn */ null, /* expensiveChecks */ true);
			var text = $element[0].innerText;
			var workingText = attr["afClickText"];
			var findTrigger = function(element) {
				if(element.getAttribute("af-click") != null)
					return element;
				return findTrigger(element.parentNode);
			}
			return function ngEventHandler(scope, element) {
				
				element.on("click", function(event, element) {
					var callback = function() {
						var ret = fn(scope, {$event:event});

						if(ret.then) {
							//IE 8 Does not support event.currentTarget
							var el = angular.element(findTrigger(event.srcElement));
							if(workingText != null)
								el.text(workingText);
							el.addClass("af-working");
							el.attr("disabled", true);
							var reset = function() {
								if(workingText != null) 
									el.text(text);
								el.removeClass("af-working");
								el.attr("disabled", null);
							}
							ret.then(reset, reset);
						}
							
					};
				  
					scope.$apply(callback);
				});
			};
		}
	}
})


.provider('$modelService', function() {
	
	var ModelService = function(types, validators, rootScope) {
		
		validationModels = {};

		this.validate = function(typeName, input, required) {
			
			var tp = types[typeName];

			if(tp == null)
				return null;

			if(required != null && required == true && (input == null || input.length == 0))
				return tp.required;
			if(input == null)
				return null;

			for(var key in tp) {
				if(typeof tp[key] === 'object') {
					var validator = validators[key];
					if(validator != null) {
						var res = validator(input, tp[key]);
						if(res != null)
							return res;
					}
				}
			}

			return null;

		}

		this.report = function(validationModel, instance, error) {
			if(validationModels[validationModel] == null)
				validationModels[validationModel] = {};

			validationModels[validationModel][instance] = error;
			rootScope.$broadcast('onModelValidation');
		}

		this.isModelValid = function(validationModel) {
			
			var model = validationModels[validationModel];
			for(var key in model) {
				if(model[key] != null)
					return false;
			}
			return true;
		}
	};

	
	this.types = {};
	this.validators = {
		pattern: function(input, p) {
			if(!p.exp.test(input))
				return p.message;
			return null;
		},
		length: function(input, p) {
			if(p.min) {
				if(input.length < p.min.length)
				return p.min.message;	
			}
			if(p.max) {
				if(input.length > p.max.length)
				return p.max.message;
			}
			return null;
		}

	};

	var staticRoot = {
			
	};
	
	this.$get = function($injector) {
		var rscope = $injector.get('$rootScope');
		return new ModelService(this.types, this.validators, rscope);
	}

	this.validator = function(name, func) {
		this.validators[name] = func;
		return this;
	}

	this.type = function(name, type) {
		this.types[name] = this.buildType("$root." + name, type);
		return this;
	}


	this.buildType = function(path, input) {
		
		var dotIndex = path.lastIndexOf(".");
		var currentLevel = null;
		var remainder = null;
		
		if(dotIndex != -1) {
			currentLevel = path.substr(dotIndex + 1);
			remainder = path.substr(0, dotIndex);
		} else {
			currentLevel = path;
		}

		var type = this.types[currentLevel];
		if(type == null)
			type = {};

		var merged = deepmerge(type, input);

		if(remainder != null)
			return this.buildType(remainder, merged);

		return merged;
	}
	

	function deepmerge(target, src) {
		
		var array = Array.isArray(src);
		var dst = array && [] || {};

		if (array) {
			target = target || [];
			dst = dst.concat(target);
			angular.forEach(src, function(e, i, obj) {
				if (typeof dst[i] === 'undefined') {
					dst[i] = e;
				} else if (typeof e === 'object') {
					dst[i] = deepmerge(target[i], e);
				} else {
					if (target.indexOf(e) === -1) {
						dst.push(e);
					}
				}
			});
		} else {
			if (target && typeof target === 'object') {
				angular.forEach(Object.keys(target), (function (key) {
					if(!src[key])
						dst[key] = target[key];
				}));
			}
			Object.keys(src).forEach(function (key) {
				if (typeof src[key] !== 'object' || !src[key]) {
					dst[key] = src[key];
				}
				else {
					if (!target[key]) {
						dst[key] = src[key];
					} else {
						dst[key] = deepmerge(target[key], src[key]);
					}
				}
			});
		}

		return dst;
	}





});

