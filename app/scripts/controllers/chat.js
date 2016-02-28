'use strict';

/**
 * @ngdoc function
 * @name packsApp.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * Controller of the packsApp
 */
angular.module('packsApp')
	.controller('ChatCtrl', function(user) {
		this.user = user.get();
	});