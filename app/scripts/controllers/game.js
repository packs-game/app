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

	angular.module('packsApp').controller('GameCtrl', function(socket, user, $scope, game, api) {
		var vm = this;
		vm.user = user.get();
		vm.data = {};
		window.GAME = vm.game = game.get();

		function handleGameEvent(data) {
			vm.game = game.get();
		}

		// events.forEach(function(e){
		// 	socket.on(e, handleGameEvent);
		// });
		socket.on('game-event', handleGameEvent);

		vm.getCurrency = function(playerIndex) {
			if (typeof playerIndex !== 'number') { return 0; }
			return vm.game.data.zones.zones['player-'+playerIndex].stacks.currency.cards.length;
		};

		vm.getDeck = function(playerIndex) {
			if (typeof playerIndex !== 'number') { return []; }
			return vm.game.data.zones.zones['player-'+playerIndex].zones.deck.stacks.deck.cards;
		};
		vm.getHand = function(playerIndex) {
			if (typeof playerIndex !== 'number') { return []; }
			return vm.game.data.zones.zones['player-'+playerIndex].zones.hand.stacks.hand.cards;
		};
		vm.getDiscard = function(playerIndex) {
			if (typeof playerIndex !== 'number') { return []; }
			return vm.game.data.zones.zones['player-'+playerIndex].stacks.discard.cards;
		};
		vm.getPlayerHand = function() {
			if (!vm.game.data.zones) { return []; }
			return vm.game.data.zones.zones['player-'+getIndex()].zones.hand.stacks.hand.cards;
		};

		vm.getActivePlayer = function() {
			if (!vm.game.data.players) { return {id:null}; }
			return vm.game.data.players[vm.game.data.activePlayer];
		};
		vm.isActivePlayer = function() {
			return vm.getActivePlayer().id === vm.user.id;
		};

		$scope.$on('$destroy', function() {
			if (socket.socket) {
				events.forEach(function(e){
					socket.socket.removeAllListeners(e);
				});
			}
		});

		vm.playCard = function(cardId) {
			if (!vm.canPlayHand()) { return console.log('not active player'); }
			api.playCard(vm.user.id, vm.user.token, cardId);
		};
		vm.pass = function() {
			api.passAction(vm.user.id,vm.user.token);
		};
		vm.buy = function(cardId) {
			if (!vm.canPlayHand()) { return console.log('not active player'); }
			api.buy(vm.user.id,vm.user.token, cardId);
		};

		function getOppIndex() {
			if (!vm.game.data.players) { return null; }
			return vm.game.data.players[0].id === vm.user.id ? 1 : 0;
		}
		function getIndex() {
			if (!vm.game.data.players) { return null; }
			return vm.game.data.players[0].id === vm.user.id ? 0 : 1;
		}
		vm.getOppIndex = getOppIndex;
		vm.getIndex = getIndex;

		vm.oppInPlay = function() {
			if (!vm.game.data.zones) { return []; }
			return vm.game.data.zones.zones.shared.zones['player-'+getOppIndex()+'-inplay'].stacks;
		};
		vm.inPlay = function() {
			if (!vm.game.data.zones) { return []; }
			return vm.game.data.zones.zones.shared.zones['player-'+getIndex()+'-inplay'].stacks;
		};

		vm.toBuy = function() {
			if (!vm.game.data.zones) { return []; }
			return vm.game.data.zones.zones.shared.zones['to-buy'].stacks;
		};
		vm.canPlayHand = function() {
			if (!vm.game.data.phases) { return false;}
			var phase = vm.game.data.phases[vm.game.data.activePhase].name;
			return vm.isActivePlayer() && (phase === 'main' || phase === 'second-main');
		};
	});

}());