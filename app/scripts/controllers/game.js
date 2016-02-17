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

	angular.module('packsApp').controller('GameCtrl', function(socket, user, $scope, game, api, cardRender, $location, $rootScope, $timeout) {
		var vm = this;
		vm.user = user.get();
		if (!vm.user.authed) { return $location.path('/'); }
		vm.data = {};
		window.GAME = vm.game = game.get();

		function handleGameEvent() {
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
		vm.redzone = function() {
			if (!vm.game.data.zones) { return []; }
			return vm.game.data.zones.zones.shared.zones.battle.stacks;
		};

		vm.getActivePlayer = function() {
			if (!vm.game.data.players) { return {id:null}; }
			return vm.game.data.players[vm.game.data.activePlayer];
		};
		vm.isActivePlayer = function() {
			return vm.getActivePlayer().id === vm.user.id;
		};
		vm.getMainFrameHealth = function(index) {
			if (!vm.game.data.zones) { return 0; }
			return 20 - (vm.game.data.zones.zones['player-'+index].stacks.mainframe.damage || 0);
		};

		$scope.$on('$destroy', function() {
			if (socket.socket) {
				events.forEach(function(e){
					socket.socket.removeAllListeners(e);
				});
			}
		});

		vm.isTargeting = false;
		vm.targetingCard = null;
		vm.playCard = function(card) {
			if (!vm.canPlayHand()) { return console.log('not active player'); }
			if (!vm.user || !vm.user.id || !vm.user.token || !card || !card.id) { return; }
			if (card.targetZonePattern) {
				vm.targetingCard = card;
				vm.isTargeting = true;
				return;
			}
			api.playCard(vm.user.id, vm.user.token, card.id);
			card.playing = true;
		};
		vm.resolveTarget = function(targetCard) {
			if (!vm.isTargeting || !vm.isValidTarget(targetCard)) { return; }

			api.playCard(vm.user.id, vm.user.token, vm.targetingCard.id, targetCard.id);
			vm.targetingCard.playing = true;
			vm.targetingCard = null;
			vm.isTargeting = false;
		};
		vm.cancelTarget = function() {
			if (!vm.isTargeting) { return; }
			vm.targetingCard = null;
			vm.isTargeting = false;
		};

		function adjustPattern(pattern) {
			var adjusted = pattern.replace('(opponent)', vm.getOppIndex());
			adjusted = adjusted.replace('(self)', vm.getIndex());
			return adjusted;
		}

		vm.isValidTarget = function(card) {
			if (!vm.isTargeting || !vm.targetingCard) { return; }
			if (card.zone === adjustPattern(vm.targetingCard.targetZonePattern)) {
				return true;
			}
			else {
				return false;
			}
		};


		vm.pass = function() {
			api.passAction(vm.user.id,vm.user.token);
			vm.attacks = [];
			vm.blocks = [];
		};
		vm.buy = function(cardId) {
			if (!vm.canPlayHand() || vm.isTargeting) { return console.log('not active player'); }
			api.buy(vm.user.id,vm.user.token, cardId);
		};
		vm.declareAttacks = function() {
			if (!vm.isActivePlayer() || !vm.canAttack()) {
				return console.log('not active player or not attackers phase');
			}
			api.declareAttacks(vm.user.id, vm.user.token, vm.attacks);
			vm.attacks = [];
		};
		vm.declareBlocks = function() {
			if (!vm.isActivePlayer() || !vm.canBlock()) {
				return console.log('not active player or not blockers phase');
			}
			api.declareBlocks(vm.user.id, vm.user.token, vm.blocks);
			vm.blocks = [];
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

		vm.canBuyAnything = function() {
			var stacks = vm.toBuy();
			var ret = false;
			var stackName;
			for (stackName in stacks) {
				if (!stacks[stackName].cards.length) { continue; }
				if (stacks[stackName].cards[0].cost <= vm.getCurrency(vm.getIndex())) {
					ret = true;
				}
			}
			return ret;
		};

		vm.inPlayCards = function() {
			var stacks = vm.inPlay();
			var ret = [];
			var stackName;
			for (stackName in stacks) {
				ret = ret.concat(stacks[stackName].cards);
			}
			return ret;
		};

		vm.canAnythingAttack = function() {
			var toRet = false;
			var cards = vm.inPlayCards();
			cards.forEach(function(c) {
				if (!c.tapped && !c.summoningSick) { toRet = true; }
			});
			return toRet;
		};


		vm.canPlayHand = function() {
			var phase = getPhase();
			return vm.isActivePlayer() && (phase === 'main' || phase === 'second-main') && !vm.isTargeting;
		};
		vm.canAttack = function() {
			var phase = getPhase();
			return vm.isActivePlayer() && (phase === 'declare-attackers');
		};
		vm.canBlock = function() {
			var phase = getPhase();
			return vm.isActivePlayer() && (phase === 'declare-defenders');
		};

		function getPhase() {
			if (!vm.game.data.phases) { return ''; }
			return vm.game.data.phases[vm.game.data.activePhase].name;
		}

		vm.isAttacking = function(cardId) {
			var toRet = false;
			vm.attacks.forEach(function(a){
				if (a.id === cardId) {
					toRet = true;
				}
			});
			return toRet;
		};
		vm.isBlocking = function(cardId) {
			var toRet = false;
			vm.blocks.forEach(function(a){
				if (a.id === cardId) {
					toRet = true;
				}
			});
			return toRet;
		};

		//{id: target: }
		vm.attacks = [];
		vm.addAttack = function(id, target) {
			if (!vm.canAttack()) { return; }
			if (vm.isAttacking(id)) { return; }
			vm.attacks.push({id: id, target: target});
		};

		vm.blocks = [];
		vm.addBlock = function(id, target) {
			if (!vm.canBlock() || !vm.activeCard) { return; }
			if (vm.isBlocking(id)) {
				vm.undo({card: {id: id}});
			}
			vm.blocks.push({id: id, target: target});
			vm.activeCard = null;
		};

		vm.undo = function($data) {
			if (vm.blocks.length) {
				var toUnblock;
				vm.blocks.forEach(function(block,i){
					if (block.id === $data.card.id) {
						toUnblock = i;
					}
				});
				if (typeof toUnblock === 'number') {
					vm.blocks.splice(toUnblock,1);
				}
			}
			if (vm.attacks.length) {
				var toUnAttack;
				vm.attacks.forEach(function(block,i){
					if (block.id === $data.card.id) {
						toUnAttack = i;
					}
				});
				if (typeof toUnAttack === 'number') {
					vm.attacks.splice(toUnAttack,1);
				}
			}
			vm.showBlocks();
		};

		vm.setActive = function(id) {
			if (getPhase() !== 'declare-defenders') { return; }

			if (vm.activeCard === id) { vm.activeCard = null; } //toggle it off
			else { vm.activeCard = id; }
		};

		vm.activeCard = null;

		vm.gameOver = function() {
			return vm.game.data.ended ? true : false;
		};
		vm.isWinner = function() {
			if (!vm.game.data.players) { return null; }
			return vm.game.data.players[vm.getIndex()].win;
		};

		vm.dropRedzoneStack = function($data,$event,target) {
			vm.setActive($data.card.id);
			vm.addBlock($data.card.id, target);
			vm.showBlocks();
		};
		vm.dropRedzone = function($data) {
			vm.addAttack($data.card.id, 'mainframe');
		};

		vm.getNextPhase = function() {
			if (!vm.game.data || !vm.game.data.phases) { return ''; }
			var p = vm.game.data.phases[vm.game.data.activePhase+1];
			if (!p) { p = vm.game.data.phases[0]; }
			return p.name;
		};

		var $ = window.$;
		vm.showBlocks = function() {
			$('.card').attr('style', '');
			vm.blocks.forEach(function(block){
				var card = $('.'+block.id).parent();
				var target = $('.'+block.target).parent();
				card.css({
					position: 'absolute',
					top: (target.offset().top+50)+ 'px',
					left: (target.offset().left+50)+ 'px',
					zIndex: 10
				});
			});
		};

		vm.render = function(card) {
			return cardRender.render(card).img;
		};

		vm.endTurn = function() {

			var phase = getPhase();
			if (phase === 'main') {
				vm.pass(); //pass main
				vm.pass(); //pass attacks
				vm.pass(); //pass second main
			}
			if (phase === 'second-main') {
				vm.pass(); //pass second main
			}
		};
		vm.mustEndTurn = function() {
			if (!vm.isActivePlayer()) { return false;}
			if (!vm.getHand(vm.getIndex()).length &&
				!vm.canBuyAnything() &&
				(!vm.inPlayCards().length || !vm.canAnythingAttack())) {
				return true;
			}
			return false;
		};
		vm.getNextPhaseText = function() {
			var phase = getPhase();
			var txt = 'Go to: ' + vm.getNextPhase();
			return txt;
		};

		vm.dragging = false;
		$rootScope.$on('draggable:start', function(ev, data) {
			if (!data || !data.data || !data.data.card) { return; }
			if (data.data.card.zone === 'hand') {
				vm.dragging = true;
			}
			$rootScope.$digest();
		});
		$rootScope.$on('draggable:end', function(ev, data) {
			if (!data || !data.data || !data.data.card) { return; }
			if (data.data.card.zone === 'hand') {
				$timeout(function() {
					vm.dragging = false;
					$rootScope.$digest();
				},0);
			}
		});
	});

}());