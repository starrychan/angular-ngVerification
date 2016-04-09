(function(w) {
	var myApp = angular.module('myApp', []);
	myApp.controller('myCtrl', function($scope) {
		// $scope.num = 'int';
		// $scope.maxLength = '6';
		$scope.options = [{
			exp: 'empty',
			msg: 'not empty'
		}];
	});
	myApp.directive('ngVerification', function() {
		return {
			restrict: 'A',
			scope: {
				ngNum: '=',
				ngVerification: '=',
				ngLength: '='
			},
			link: function(scope, element, attrs) {
				var exp = {
						empty: /\S/,
						phone: /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$|(^(13[0-9]|15[0|3|6|7|8|9]|18[8|9])\d{8}$)/,
						email: /(^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$)|(^$)/,
						url: /^[a-zA-z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))*(\?\S*)?$/
					},
					deviation = 15, //tips显示误差修正值
					tipHeight = 30,
					_isSelect = false, //处理长度限制的异常
					tipsDom = {
						obj: null
					};
				element.css({
					'position': 'relative'
				});

				//正则匹配
				function customVal(type, val) {
					var currentExp = null;
					if (exp[type.exp]) {
						currentExp = exp[type.exp];
					} else if (Object.prototype.toString.call(type.exp) === '[object RegExp]') {
						currentExp = type.exp;
					} else {
						return true;
					};
					if (!currentExp.test(val)) {
						return tips(function(_this) {
							_this.html(type.msg);
						});
					};
					return true;
				};

				//整数限制
				function isIntNum(evt) {
					if (!(evt.keyCode == 46) && !(evt.keyCode == 8) && !(evt.keyCode == 37) && !(evt.keyCode == 39))
						if (!((evt.keyCode >= 48 && evt.keyCode <= 57) || (evt.keyCode >= 96 && evt.keyCode <= 105)))
							evt.preventDefault();
				};

				//浮点数限制
				function isFloatNum(evt) {
					if (!(evt.keyCode == 46) && !(evt.keyCode == 8) && !(evt.keyCode == 37) && !(evt.keyCode == 39))
						if (!((evt.keyCode >= 48 && evt.keyCode <= 57) || (evt.keyCode >= 96 && evt.keyCode <= 105) || evt.keyCode == 190))
							evt.preventDefault();
				};
				
				//长度限制
				function isLength(evt, val, maxLength) {
					if (!(evt.keyCode == 46) && !(evt.keyCode == 8) && !(evt.keyCode == 37) && !(evt.keyCode == 39) && !_isSelect) {
						if (val.strLen() >= maxLength) {
							evt.preventDefault();
						}
					}
				};

				function tips(callback) {
					var tipsObj = tipsDom.obj;
					var offsetY = element.offset().top,
						offsetX = element.offset().left,
						domHeight = element.height(),
						bodyHeight = $('html').height();
					var arrowClass = null;
					if (bodyHeight - offsetY < 30) {
						offsetY = offsetY - tipHeight - deviation;
						arrowClass = 'ng-verification-arrowUp';
					} else {
						offsetY = offsetY + domHeight + deviation;
						arrowClass = 'ng-verification-arrowDown'
					};
					if (tipsObj) {
						tipsObj.show().css({
							top: offsetY,
							left: offsetX
						}).attr('class', arrowClass);
						callback && callback(tipsObj);
					} else {
						tipsDom.obj = $('<div id="ng-verification" class="' + arrowClass + '" style="position:absolute;top:' + offsetY + 'px;left:' + offsetX + 'px"></div>').appendTo('body');
						callback && callback(tipsDom.obj);
					};
					return false;
				};

				String.prototype.strLen = function() {
					var len = 0;
					for (var i = 0; i < this.length; i++) {
						if (this.charCodeAt(i) > 127 || this.charCodeAt(i) == 94) {
							len += 2;
						} else {
							len++;
						}
					}
					return len;
				};

				element.on('blur', function() {
					var _this = this,
						val = $(this).val();
					if (!scope.ngVerification) return;
					for (var i = 0, len = scope.ngVerification.length; i < len; i++) {
						var eachData = scope.ngVerification[i];
						if (!eachData.exp) return;
						if (!customVal(eachData, val)) {
							element.select().focus();
							_isSelect = true;
							break;
						}
					}
				});

				//限制
				element.on('keydown', function(evt) {
					var evt = window.event || evt,
						val = $(this).val();

					if (tipsDom.obj && !$(tipsDom.obj).is(':hidden')) {
						$(tipsDom.obj).hide();
					};
					if (scope.ngNum) {
						switch (scope.ngNum) {
							case 'int':
								isIntNum(evt);
								break;
							case 'float':
								isFloatNum(evt);
								break;
							default:
								break;
						}
					};
					if (scope.ngLength) {
						isLength(evt, val, scope.ngLength);
					};
				});

				element.on('keyup', function(evt) {
					var evt = window.event || evt;
					_isSelect = false;
					if (evt.keyCode == 13) {
						element.trigger('blur');
					};
				})
			}
		}
	})
})(window)