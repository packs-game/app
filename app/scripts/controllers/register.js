'use strict';

/**
 * @ngdoc function
 * @name packsApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the packsApp
 */
angular.module('packsApp')
	.controller('RegisterCtrl', function($scope, user, $location) {
		var vm = this;
		vm.user = user.get();

		vm.register = function() {
			user.register(vm.username, vm.password).then(function(){
				if (vm.user.authed) {
					$location.path('/');
				}
			});
		};
	});