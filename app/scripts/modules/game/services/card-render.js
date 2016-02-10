'use strict';
(function() {
	angular.module('packsApp').factory('cardRender', [function() {
		var createjs = window.createjs;

		var canvas = document.createElement('canvas');
		canvas.width = 180;
		canvas.height = 252;
		canvas.style = 'display: none;';
		document.body.appendChild(canvas);

		var ready = false;

		function loaded() {
			toLoad++;
			if (toLoad === totalLoad) {
				ready = true;
				onReady.forEach(function(obj) {
					render(obj.name, obj.text, obj.cb);
				});
				onReady = [];
			}
		}
		var toLoad = 0;
		var totalLoad = 4;
		var bg = new createjs.Bitmap('images/background.png');
		var bg2 = new createjs.Bitmap('images/typebg.png');
		var img = new createjs.Bitmap('images/card-img.png');
		var overlay = new createjs.Bitmap('images/overlay.png');
		bg.image.onload = loaded;
		bg2.image.onload = loaded;
		img.image.onload = loaded;
		overlay.image.onload = loaded;

		var onReady = [];

		function render(name, text, cb) {
			if (!ready) {
				return onReady.push({
					name: name,
					text: text,
					cb: cb
				});
			}
			cardText.text = text;
			titleTxt.text = name;
			if (cardText.text && typeof cardText.text === 'string') {
				if (cardText.text.split('\n').length === 2) {
					cardText.y = 220;
				} else if (cardText.text.split('\n').length === 3) {
					cardText.y = 212;
				} else {
					cardText.y = 225;
				}
			} else {
				cardText.y = 225;
			}
			stage.update();
			var data = stage.toDataURL();
			if (cb) { cb(data); }
			return data;
		}

		var stage = new createjs.Stage(canvas);
		img.x = 10;
		img.y = 48;
		stage.addChild(bg);
		stage.addChild(bg2);
		stage.addChild(img);
		stage.addChild(overlay);

		var titleTxt = new createjs.Text('', '20px Arial', 'black');
		titleTxt.x = 90;
		titleTxt.y = 30;
		titleTxt.textBaseline = 'alphabetic';
		titleTxt.textAlign = 'center';
		stage.addChild(titleTxt);

		var cardText = new createjs.Text('', '14px Arial', 'black');
		cardText.x = 90;
		cardText.y = 230;
		cardText.textBaseline = 'alphabetic';
		cardText.textAlign = 'center';
		stage.addChild(cardText);

		return {
			render: render
		};
	}]);
}());