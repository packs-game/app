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
				onReady.forEach(render.call);
				onReady = [];
			}
		}
		var toLoad = 0;
		var totalLoad = 6;
		var bg = new createjs.Bitmap('images/background.png');
		var bg2 = new createjs.Bitmap('images/typebg.png');
		var bg22 = new createjs.Bitmap('images/type2bg.png');
		var img = new createjs.Bitmap('images/card-img.png');
		var overlay = new createjs.Bitmap('images/overlay.png');
		var overlay2 = new createjs.Bitmap('images/type2-overlay.png');
		bg.image.onload = loaded;
		bg2.image.onload = loaded;
		bg22.image.onload = loaded;
		img.image.onload = loaded;
		overlay.image.onload = loaded;
		overlay2.image.onload = loaded;

		var onReady = [];

		function render(card, cb) {
			var name = card.name;
			var text = card.text;

			if (!ready) {
				return onReady.push([card,cb]);
			}
			var stage = new createjs.Stage(canvas);
			img.x = 10;
			img.y = 48;
			
			var titleTxt = new createjs.Text('', '20px Arial', 'black');
			titleTxt.x = 90;
			titleTxt.y = 30;
			titleTxt.textBaseline = 'alphabetic';
			titleTxt.textAlign = 'center';

			var cardText = new createjs.Text('', '14px Arial', 'black');
			cardText.x = 90;
			cardText.y = 230;
			cardText.textBaseline = 'alphabetic';
			cardText.textAlign = 'center';
			
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

			stage.addChild(bg);

			if (card.type === 'token') {
				cardText.text = card.power;
				cardText.font = 'bold 40px Arial';
				stage.addChild(bg22);
			} else {
				stage.addChild(bg2);
			}
			stage.addChild(img);
			
			if (card.type === 'token') {
				stage.addChild(overlay2);
			} else {
				stage.addChild(overlay);
			}
			
			stage.addChild(titleTxt);
			stage.addChild(cardText);

			stage.update();
			var data = stage.toDataURL();
			if (cb) { cb(data); }
			return data;
		}

		return {
			render: render
		};
	}]);
}());