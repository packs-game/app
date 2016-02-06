'use strict';

/**
 * @ngdoc function
 * @name packsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the packsApp
 */
(function() {
	var events = [
		'zone:created',
		'phase:created',
		'game:addedPhase',
		'zone:addedZone',
		'stack:created',
		'zone:addedStack',
		'player:created',
		'game:addedPlayer',
		'stack:addedCard',
		'card:created',
		'card:zoneChange',
		'card:stackChange',
		'stack:shuffledCards',
		'stack:removedCard',
		'game:started',
		'game:activePlayerChange',
		'game:newTurn',
		'game:activePhaseChange',
		'phase:entered'
	];

	angular.module('packsApp').controller('GameCtrl', function(socket, user, $scope, game) {
		var vm = this;
		vm.user = user.get();
		vm.data = {};
		window.GAME = vm.game = game.get();

		function handleGameEvent(data) {
			console.log('handle event', JSON.parse(data));
			vm.data = data;
		}

		// events.forEach(function(e){
		// 	socket.on(e, handleGameEvent);
		// });
		socket.on('game-event', handleGameEvent);

		vm.getCurrency = function(playerIndex) {
			return vm.game.data.zones.zones['player-'+playerIndex].stacks.currency.cards.length;
		};

		vm.getDeck = function(playerIndex) {
			return vm.game.data.zones.zones['player-'+playerIndex].zones.deck.stacks.deck.cards;
		};
		vm.getHand = function(playerIndex) {
			return vm.game.data.zones.zones['player-'+playerIndex].zones.hand.stacks.hand.cards;
		};
		vm.getDiscard = function(playerIndex) {
			return vm.game.data.zones.zones['player-'+playerIndex].stacks.discard.cards;
		};

		$scope.$on('$destroy', function() {
			if (socket.socket) {
				events.forEach(function(e){
					socket.socket.removeAllListeners(e);
				});
			}
		});
	});

}());