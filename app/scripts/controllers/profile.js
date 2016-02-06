'use strict';

/**
 * @ngdoc function
 * @name packsApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the packsApp
 */
angular.module('packsApp')
	.controller('ProfileCtrl', function($scope, user, $location) {
		var vm = this;
		vm.user = user.get();

		vm.logout = function() {
			user.logout().then(function() {
				$location.url('/login');
			});
		};
	});