'use strict';

/**
 * @ngdoc function
 * @name packsApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the packsApp
 */
angular.module('packsApp')
	.controller('MatchmakingCtrl', function($scope, user, api, socket, $location) {
		var vm = this;
		vm.user = user.get();
		vm.sendingMessage = false;
		vm.searching = false;

		vm.search = function() {
			vm.sendingMessage = true;
			api.matchmake(vm.user.id, vm.user.token).then(function() {
				vm.searching = true;
				vm.sendingMessage = false;
			});
		};
		vm.cancel = function() {
			vm.sendingMessage = true;
			api.cancelMatchmake(vm.user.id, vm.user.token).then(function() {
				vm.searching = false;
				vm.sendingMessage = false;
			});
		};

		function handleGameEvent(data) {
			return $location.path('/game');
		}

		socket.on('game-started', handleGameEvent);

		$scope.$on('$destroy', function() {
			if (socket.socket) {
				socket.socket.removeAllListeners('start-of-game');
			}
		});
	});