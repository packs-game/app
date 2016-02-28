'use strict';
(function() {
	var services;

	//singleton
	var socketInstance = null;

	var SocketConnection = function() {
		if (socketInstance) { return socketInstance; }
		this.loaded = false;
		this.readyFunctions = [];
		this.emitReadyFunctions = [];
		this.scope = null;
		this.socket = null;

		socketInstance = this;
		return this;
	};

	SocketConnection.prototype.on = function(eventName, callback) {
		var self = this;
		if (!self.loaded) {
			return self.readyFunctions.push({ev: eventName, fn: callback});
		}
		self.socket.on(eventName, function() {
			var args = arguments;
			self.scope.$apply(function() {
				callback.apply(self.socket, args);
			});
		});
	};

	SocketConnection.prototype.emit = function(eventName, data, callback) {
		var self = this;
		if (!self.loaded) {
			return self.emitReadyFunctions.push({ev: eventName, data: data, fn: callback});
		}
		
		self.socket.emit(eventName, data, function() {
			var args = arguments;
			self.scope.$apply(function() {
				if (callback) {
					callback.apply(self.socket, args);
				}
			});
		});
	};

	SocketConnection.prototype.ready = function(socket, scope) {
		var self = this;
		self.socket = socket;
		self.scope = scope;

		self.loaded = true;
		self.readyFunctions.forEach(function(rdy) {
			self.on(rdy.ev, rdy.fn);
		});
		self.emitReadyFunctions.forEach(function(rdy) {
			self.emit(rdy.ev, rdy.data, rdy.fn);
		});
		self.readyFunctions = [];
		self.emitReadyFunctions = [];
		
	};

	angular.module('packsApp').factory('socket', ['allServices', '$rootScope', function(allServices, $rootScope) {
		if (socketInstance) { return socketInstance; }

		socketInstance = new SocketConnection();
		allServices.get().then(function(data) {
			services = data;
			load();
		});

		function load() {
			var s = document.createElement('script');
			s.src = services.socket + '/socket.io/socket.io.js';
			s.onload = init;
			document.body.appendChild(s);
		}

		function init() {
			socketInstance.ready(window.io(services.socket), $rootScope);
		}

		return socketInstance;
	}]);
}());