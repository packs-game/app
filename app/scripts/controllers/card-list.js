'use strict';

/**
 * @ngdoc function
 * @name packsApp.controller:CardListCtrl
 * @description
 * # CardListCtrl
 * Controller of the packsApp
 */
angular.module('packsApp')
	.controller('CardListCtrl', function(cardRender, api) {
		var vm = this;
		api.ready(function() {
			api.getAllCards().then(function(res){
				vm.cards = res.data;
			});
		});

		vm.renderCard = function(card) {
			return cardRender.render(card);
		};

		vm.renderer = cardRender;

		vm.tierMap = [null,4,3,2];
	});