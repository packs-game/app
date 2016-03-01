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
		// 'zone:created',
		// 'phase:created',
		// 'game:addedPhase',
		// 'zone:addedZone',
		// 'stack:created',
		// 'zone:addedStack',
		// 'player:created',
		// 'game:addedPlayer',
		// 'stack:addedCard',
		// 'card:created',
		// 'card:zoneChange',
		// 'card:stackChange',
		// 'stack:shuffledCards',
		// 'stack:removedCard',
		// 'game:started',
		// 'game:activePlayerChange',
		// 'game:newTurn',
		// 'game:activePhaseChange',
		// 'phase:entered'

		'game-event',
		'card-played',
		'active-pass',
		'buy',
		'attacks',
		'end-turn'
	];

	angular.module('packsApp').controller('GameCtrl', function(socket, user, $scope, game, api, cardRender, $location, $rootScope, $timeout) {
		var vm = this;
		vm.user = user.get();
		if (!vm.user.authed) {
			return $location.path('/');
		}
		vm.data = {};
		window.GAME = vm.game = game.get();

		function handleGameEvent() {
			vm.game = game.get();
		}

		vm.actionlog = [];

		function handleCardPlay(card){
			//this is lazy and bad. so... yea
			return cardRender.render(card, function(c) {
				vm.actionlog.push({action: 'card-played', img: (card.img ? '/images/cards/'+card.img : c.img)});
				if (card.owner === vm.getIndex()) { return; }
				//only animate the play if the opponent did it
				var img = $('<div class="card float"><img src="'+c.img+'"/></div>').appendTo('.gameboard');
				img.css({
					position: 'absolute',
					zIndex: 100,
					left: '50%',
					top: '-30%'
				});
				img.animate({
					left: '20%',
					top: '30%'
				}, function() {
					setTimeout(function() {
						img.fadeOut(function() {
							img.remove();
						});
					},1000);
				});
			});
		}

		function handlePass(passingPlayerIndex) {
			//we hide a lot of this under the hood so best not to expose it...
			//vm.actionlog.push({action: 'active-pass', img: '/images/board/action-pass.png'});
		}

		function handleBuy(buyingPlayerIndex) {
			vm.actionlog.push({action: 'buy', img: '/images/board/action-buy.png'});
		}

		function handleAttacks(attacks) {
			vm.actionlog.push({action: 'attacks', img: '/images/board/action-attack.png'});
		}
		function handleBlocks(blocks) {
			vm.actionlog.push({action: 'blocks', img: '/images/board/action-block.png'});
		}
		function handleEot(passingPlayerIndex) {
			vm.actionlog.push({action: 'end-turn', img: '/images/board/action-end-turn.png'});
		}

		// events.forEach(function(e){
		// 	socket.on(e, handleGameEvent);
		// });
		socket.on('game-event', handleGameEvent);
		socket.on('card-played', handleCardPlay);
		socket.on('active-pass', handlePass);
		socket.on('buy', handleBuy);
		socket.on('attacks', handleAttacks);
		socket.on('blocks', handleBlocks);
		socket.on('end-turn', handleEot);

		vm.getCurrency = function(playerIndex) {
			if (typeof playerIndex !== 'number') {
				return 0;
			}
			return vm.game.data.zones.zones['player-' + playerIndex].stacks.currency.cards.length;
		};

		vm.getDeck = function(playerIndex) {
			if (typeof playerIndex !== 'number') {
				return [];
			}
			return vm.game.data.zones.zones['player-' + playerIndex].zones.deck.stacks.deck.cards;
		};
		vm.getHand = function(playerIndex) {
			if (typeof playerIndex !== 'number') {
				return [];
			}
			return vm.game.data.zones.zones['player-' + playerIndex].zones.hand.stacks.hand.cards;
		};
		vm.getDiscard = function(playerIndex) {
			if (typeof playerIndex !== 'number') {
				return [];
			}
			return vm.game.data.zones.zones['player-' + playerIndex].stacks.discard.cards;
		};
		vm.getPlayerHand = function() {
			if (!vm.game.data.zones) {
				return [];
			}
			return vm.game.data.zones.zones['player-' + getIndex()].zones.hand.stacks.hand.cards;
		};
		vm.redzone = function() {
			if (!vm.game.data.zones) {
				return [];
			}
			return orderStacks(vm.game.data.zones.zones.shared.zones.battle.stacks);
		};

		vm.getActivePlayer = function() {
			if (!vm.game.data.players) {
				return {
					id: null
				};
			}
			return vm.game.data.players[vm.game.data.activePlayer];
		};
		vm.isActivePlayer = function() {
			return vm.getActivePlayer().id === vm.user.id;
		};
		vm.getMainFrameHealth = function(index) {
			if (!vm.game.data.zones) {
				return 0;
			}
			return vm.game.data.zones.zones['player-' + index].stacks.mainframe.cards[0].toughness || 0;
		};

		vm.getMainframe = function(index) {
			if (!vm.game.data.zones) { return {}; }
			return vm.game.data.zones.zones['player-' + index].stacks.mainframe.cards[0];
		};

		$scope.$on('$destroy', function() {
			if (socket.socket) {
				events.forEach(function(e) {
					socket.socket.removeAllListeners(e);
				});
			}
		});

		vm.isTargeting = false;
		vm.targetingCard = null;
		vm.playCard = function(card) {
			if (!vm.canPlayHand()) {
				return console.log('not active player');
			}
			if (!vm.user || !vm.user.id || !vm.user.token || !card || !card.id) {
				return;
			}
			if (card.targetZonePattern) {
				vm.targetingCard = card;
				vm.isTargeting = true;
				return;
			}
			api.playCard(vm.user.id, vm.user.token, card.id);
			card.playing = true;
		};
		vm.resolveTarget = function(targetCard) {
			if (!vm.isTargeting || !vm.isValidTarget(targetCard)) {
				return;
			}

			api.playCard(vm.user.id, vm.user.token, vm.targetingCard.id, targetCard.id);
			vm.targetingCard.playing = true;
			vm.targetingCard = null;
			vm.isTargeting = false;
		};
		vm.cancelTarget = function() {
			if (!vm.isTargeting) {
				return;
			}
			vm.targetingCard = null;
			vm.isTargeting = false;
		};

		function adjustPattern(pattern) {
			var adjusted = pattern.replace('(opponent)', vm.getOppIndex());
			adjusted = adjusted.replace('(self)', vm.getIndex());
			return adjusted;
		}

		vm.isValidTarget = function(card) {
			if (!vm.isTargeting || !vm.targetingCard || !card) {
				return false;
			}
			if (card.zone === adjustPattern(vm.targetingCard.targetZonePattern)) {
				return true;
			}
			if (vm.targetingCard.targetZonePattern === 'inplay' && (card.zone.indexOf('inplay') > -1)) {
				return true;
			}
			if (vm.targetingCard.targetZonePattern === 'anycreatureplayer' &&
				((card.zone.indexOf('inplay') > -1) || card.stack === 'mainframe')) {
				return true;
			}
			return false;
		};


		vm.pass = function() {
			return api.passAction(vm.user.id, vm.user.token);
		};
		vm.buy = function(cardId) {
			if (!vm.canPlayHand() || vm.isTargeting) {
				return console.log('not active player');
			}
			api.buy(vm.user.id, vm.user.token, cardId);
		};
		vm.declareAttacks = function() {
			if (!vm.isActivePlayer() || !vm.canAttack()) {
				return console.log('not active player or not attackers phase');
			}
			api.declareAttacks(vm.user.id, vm.user.token, vm.attacks);
		};
		vm.declareBlocks = function() {
			if (!vm.isActivePlayer() || !vm.canBlock()) {
				return console.log('not active player or not blockers phase');
			}
			api.declareBlocks(vm.user.id, vm.user.token, vm.blocks);
			vm.blocks = [];
		};



		function getOppIndex() {
			if (!vm.game.data.players) {
				return null;
			}
			return vm.game.data.players[0].id === vm.user.id ? 1 : 0;
		}

		function getIndex() {
			if (!vm.game.data.players) {
				return null;
			}
			return vm.game.data.players[0].id === vm.user.id ? 0 : 1;
		}
		vm.getOppIndex = getOppIndex;
		vm.getIndex = getIndex;

		function orderStacks(stacks) {
			var stacksArr = [];
			for (var name in stacks) {
				stacksArr.push(stacks[name]);
			}
			stacksArr.sort(function(a,b){
				if (!b.cards[0]) { return 1; }
				if (!a.cards[0]) { return -1; }
				if (a.cards[0].enterPlayTS > b.cards[0].enterPlayTS) {
					return 1;
				}
				if (a.cards[0].enterPlayTS < b.cards[0].enterPlayTS) {
					return -1;
				}
				return 0;
			});
			return stacksArr;
		}

		vm.oppInPlay = function() {
			if (!vm.game.data.zones) {
				return [];
			}
			var stacks = vm.game.data.zones.zones.shared.zones['player-' + getOppIndex() + '-inplay'].stacks;

			return orderStacks(stacks);
		};
		vm.inPlay = function() {
			if (!vm.game.data.zones) {
				return [];
			}
			var stacks = vm.game.data.zones.zones.shared.zones['player-' + getIndex() + '-inplay'].stacks;

			return orderStacks(stacks);
		};

		vm.toBuy = function() {
			if (!vm.game.data.zones) {
				return [];
			}
			return vm.game.data.zones.zones.shared.zones['to-buy'].stacks;
		};

		vm.canBuyAnything = function() {
			var stacks = vm.toBuy();
			var ret = false;
			var stackName;
			for (stackName in stacks) {
				if (!stacks[stackName].cards.length) {
					continue;
				}
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
				if (!c.tapped && !c.summoningSick) {
					toRet = true;
				}
			});
			return toRet;
		};


		vm.canPlayHand = function() {
			var phase = getPhase();
			return vm.isActivePlayer() && (phase === 'main' || phase === 'second-main') && !vm.isTargeting;
		};
		vm.canAttack = function() {
			var phase = getPhase();
			return vm.isActivePlayer() && (phase === 'declare-attackers' || phase === 'main');
		};
		vm.canBlock = function() {
			var phase = getPhase();
			return vm.isActivePlayer() && (phase === 'declare-defenders');
		};

		function getPhase() {
			if (!vm.game.data.phases) {
				return '';
			}
			return vm.game.data.phases[vm.game.data.activePhase].name;
		}
		vm.getPhase = getPhase;

		vm.isAttacking = function(cardId) {
			var toRet = false;
			vm.attacks.forEach(function(a) {
				if (a.id === cardId) {
					toRet = true;
				}
			});
			return toRet;
		};
		vm.isBlocking = function(cardId) {
			var toRet = false;
			vm.blocks.forEach(function(a) {
				if (a.id === cardId) {
					toRet = true;
				}
			});
			return toRet;
		};

		//{id: target: }
		vm.attacks = [];
		vm.addAttack = function(id, target) {
			if (!vm.canAttack()) {
				return;
			}
			if (vm.isAttacking(id)) {
				return;
			}
			vm.attacks.push({
				id: id,
				target: target
			});
		};

		vm.blocks = [];
		vm.addBlock = function(id, target) {
			if (!vm.canBlock() || !vm.activeCard) {
				return;
			}
			if (vm.isBlocking(id)) {
				vm.undo({
					card: {
						id: id
					}
				});
			}
			vm.blocks.push({
				id: id,
				target: target
			});
			vm.activeCard = null;
		};

		vm.undo = function($data) {
			if (vm.blocks.length) {
				var toUnblock;
				vm.blocks.forEach(function(block, i) {
					if (block.id === $data.card.id) {
						toUnblock = i;
					}
				});
				if (typeof toUnblock === 'number') {
					vm.blocks.splice(toUnblock, 1);
				}
			}
			if (vm.attacks.length) {
				var toUnAttack;
				vm.attacks.forEach(function(block, i) {
					if (block.id === $data.card.id) {
						toUnAttack = i;
					}
				});
				if (typeof toUnAttack === 'number') {
					vm.attacks.splice(toUnAttack, 1);
				}
			}
		};

		vm.setActive = function(id) {
			if (getPhase() !== 'declare-defenders') {
				return;
			}

			if (vm.activeCard === id) {
				vm.activeCard = null;
			} //toggle it off
			else {
				vm.activeCard = id;
			}
		};

		vm.activeCard = null;

		vm.gameOver = function() {
			return vm.game.data.ended ? true : false;
		};
		vm.isWinner = function() {
			if (!vm.game.data.players) {
				return null;
			}
			return vm.game.data.players[vm.getIndex()].win;
		};

		vm.dropRedzoneStack = function($data, $event, target) {
			vm.setActive($data.card.id);
			vm.addBlock($data.card.id, target);
		};
		vm.dropRedzone = function($data) {
			vm.addAttack($data.card.id, 'mainframe');
		};

		vm.render = function(card) {
			return cardRender.render(card).img;
		};

		vm.mustEndTurn = function() {
			if (!vm.isActivePlayer()) {
				return false;
			}
			if (!vm.getHand(vm.getIndex()).length &&
				!vm.canBuyAnything() &&
				(!vm.inPlayCards().length || !vm.canAnythingAttack())) {
				return true;
			}
			return false;
		};

		vm.dragging = false;
		$rootScope.$on('draggable:start', function(ev, data) {
			if (!data || !data.data || !data.data.card) {
				return;
			}
			if (data.data.card.zone === 'hand') {
				vm.dragging = true;
			}
			$rootScope.$digest();
		});
		$rootScope.$on('draggable:end', function(ev, data) {
			if (!data || !data.data || !data.data.card) {
				return;
			}
			if (data.data.card.zone === 'hand') {
				$timeout(function() {
					vm.dragging = false;
					$rootScope.$digest();
				}, 0);
			}
		});


		vm.buttonText = function() {
			var txt = '';
			var phase = getPhase();
			if ((phase === 'main' && !vm.attacks.length) || phase === 'second-main') {
				txt = 'End Turn';
			}
			if ((phase === 'main' || phase === 'declare-attackers') && vm.attacks.length > 0) {
				txt = 'Attack!';
			}
			if (phase === 'declare-attackers' && !vm.attacks.length) {
				txt = 'No Attacks';
			}
			if (phase === 'declare-defenders' && !vm.blocks.length) {
				txt = 'No Blocks';
			}
			if (phase === 'declare-defenders' && vm.blocks.length > 0) {
				txt = 'Block!';
			}
			return txt;
		};

		vm.buttonAction = function() {
			var phase = getPhase();
			if ((phase === 'main' && !vm.attacks.length) || phase === 'second-main') {
				vm.endTurn();
			}
			if (phase === 'main' && vm.attacks.length > 0) {
				vm.pass().then(function() {
					vm.declareAttacks();
					vm.attacks = [];
				});
			}
			if (phase === 'declare-attackers' && vm.attacks.length > 0) {
				vm.declareAttacks();
				vm.attacks = [];
			}
			if (phase === 'declare-attackers' && !vm.attacks.length) {
				vm.pass();
			}
			if (phase === 'declare-defenders' && !vm.blocks.length) {
				vm.pass();
				vm.blocks = [];
			}
			if (phase === 'declare-defenders' && vm.blocks.length > 0) {
				vm.declareBlocks();
			}
		};

		vm.endTurn = function() {
			var phase = getPhase();
			if (phase === 'main') {
				vm.pass().then(function() {	//pass main
					vm.pass().then(function() { //pass attacks
						vm.pass(); //pass second main
					});
				});
			}
			if (phase === 'second-main') {
				vm.pass(); //pass second main
			}
			vm.isTargeting = false;
			vm.targetingCard = null;
		};

		vm.getBlockCount = function(id) {
			var ret = [];
			vm.blocks.forEach(function(b){
				if (b.target === id) {
					ret.push(b);
				}
			});
			return ret.length;
		};
		vm.getBlocks = function(id) {
			var inPlay = vm.inPlay();
			var map = {};
			inPlay.forEach(function(c) {
				if (!c.cards.length) { return; }
				map[c.cards[0].id] = c.cards[0];
			});
			var ret = [];
			vm.blocks.forEach(function(b){
				if (b.target === id) {
					ret.push(map[b.id]);
				}
			});
			return ret;	
		}
	});

}());


angular.module('packsApp').filter('reverse', function() {
  return function(items) {
  	if (!Array.isArray(items)) { return items; } //can only reverse arrays
    return items.slice().reverse();
  };
});
