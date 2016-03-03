'use strict';

/**
 * @ngdoc function
 * @name packsApp.controller:RootCtrl
 * @description
 * # RootCtrl
 * Controller of the packsApp
 */
angular.module('packsApp')
	.controller('RootCtrl', function(socket, $scope, api, user) {
		var vm = this;

		function handleBPEvent(data) {
			alert('You gained power! +' + data);
			getBP();
		}

		socket.on('backpack:change-power', handleBPEvent);

		$scope.$on('$destroy', function() {
			if (socket.socket) {
				socket.socket.removeAllListeners('backpack:change-power');
			}
		});

		vm.userBackpack = {

		};

		function getBP() {
			api.ready(function() {
				api.getBackpack($scope.user.id, $scope.user.token).then(function(bp){
					vm.userBackpack = bp.data;
				});
			});
		}
		$scope.user = user.get();
		$scope.$watch('user.authed', getBP);
	});