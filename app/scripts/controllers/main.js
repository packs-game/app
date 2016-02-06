'use strict';

/**
 * @ngdoc function
 * @name packsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the packsApp
 */
angular.module('packsApp')
	.controller('MainCtrl', function($scope, user) {
		this.user = user.get();
	});