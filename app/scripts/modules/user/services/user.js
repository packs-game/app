'use strict';

angular.module('packsApp').factory('user', ['api', 'socket', function(api, socket) {
	var user = {
		authed: false,
		error: ''
	};

	function logout() {
		user.authed = false;
		user.error = '';
		delete user.username;
		delete user.id;
		delete user.token;
	}

	function setAuthed(res) {
		var data = res.data;
		user.username = data.name;
		user.id = data.id;
		user.token = data.token;
		user.authed = true;

		//auth to the socket
		socket.emit('auth', {id: user.id, token: user.token });
	}

	function setFail(res) {
		var error;
		if (res.data && res.data.error) {
			error = res.data.error;
		}
		if (res.status === 0) { error = 'Failed to contact auth server.'; }
		user.error = error;
	}

	function getUser() {
		return api.getUser().then(setAuthed, setFail);
	}

	return {
		get: function() {
			api.ready(getUser);
			return user;
		},
		login: function(username, password) {
			return api.login(username,password).then(setAuthed, setFail);
		},
		logout: function() {
			return api.logout().then(logout);
		},
		register: function(username, password) {
			return api.register(username, password).then(getUser, setFail);
		},
		getUser: getUser
	};
}]);