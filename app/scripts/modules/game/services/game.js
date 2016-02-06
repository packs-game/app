'use strict';
(function() {
	angular.module('packsApp').factory('game', ['api', 'user', function(api, user) {
		var game = {
			data: {}
		};
		var u = user.get();
		
		function get() {
			if (!u.id || !u.token) { return; }
			api.getGame(u.id, u.token).then(function(data){
				game.data = data.data;
			});
		}
		return {
			get: function() {
				get();
				return game;
			}
		};
	}]);
}());