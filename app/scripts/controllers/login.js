'use strict';

/**
 * @ngdoc function
 * @name packsApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the packsApp
 */
angular.module('packsApp')
	.controller('LoginCtrl', function($scope, user, $location) {
		var vm = this;
		vm.user = user.get();

		function redirect() {
			if (vm.user.authed) {
				return $location.path('/');
			}
			if (vm.user.error === 'Already Authenticated') {
				user.getUser().then(redirect);
			}
		}

		vm.login = function() {
			user.login(vm.username, vm.password).then(redirect);
		};
	});