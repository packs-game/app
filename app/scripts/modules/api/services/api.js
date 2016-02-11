'use strict';

angular.module('packsApp').factory('api', ['$http', 'allServices', function($http, allServices) {
	var config = {
		withCredentials: true
	};

	var services;

	allServices.get().then(function(s){ services = s; });
	
	var API = {
		login: function(username, password) {
			return $http.post(services.auth + '/login', {
				username: username,
				password: password
			}, config);
		},
		register: function(username, password) {
			return $http.post(services.auth + '/register', {
				username: username,
				password: password
			}, config);
		},
		logout: function() {
			return $http.get(services.auth + '/logout', config);
		},
		getUser: function() {
			return $http.get(services.auth + '/user', config);
		},

		
		matchmake: function(id, token) {
			return $http.post(services.matchmaking + '/search-game', {id: id, token: token}, config);
		},
		cancelMatchmake: function(id, token) {
			return $http.post(services.matchmaking + '/cancel-search-game', {id: id, token: token}, config);
		},
		getGame: function(id, token) {
			return $http.post(services.game + '/game', {id: id, token: token}, config);
		},
		playCard: function(id,token,cardId,targetId) {
			return $http.post(services.game + '/game/play-card', {id: id, token: token, card: cardId, target: targetId}, config);
		},
		passAction: function(id,token) {
			return $http.post(services.game + '/game/pass', {id: id, token: token}, config);
		},
		buy: function(id,token,cardId) {
			return $http.post(services.game + '/game/buy', {id: id, token: token, card: cardId}, config);
		},
		declareAttacks: function(id,token,attacks) {
			return $http.post(services.game + '/game/attack', {id: id, token: token, attacks: attacks}, config);
		},
		declareBlocks: function(id,token,blocks) {
			return $http.post(services.game + '/game/block', {id: id, token: token, blocks: blocks}, config);
		}
	};

	return API;
}]);

angular.module('packsApp').factory('allServices', ['$window', '$http', function($window, $http) {
	var services;
	function get() {
		return $http.get('/services.json').then(function(res){
			services = res.data;
			return services;
		}, function(err) {
			$window.alert('Cannot get services list.');
			console.log(err);
		});
	}

	return {
		get: get
	};
}]);