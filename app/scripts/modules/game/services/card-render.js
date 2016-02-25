'use strict';
(function() {
	angular.module('packsApp').factory('cardRender', [function() {
		var createjs = window.createjs;

		var canvas = document.createElement('canvas');
		canvas.width = 180;
		canvas.height = 252;
		canvas.style = 'display: none;';
		document.body.appendChild(canvas);

		var onReady = [];
		var ready = false;

		var loaded = 0;
		function checkLoaded() {
			loaded++;
			if (loaded === imgs.length) {
				ready = true;
				onReady.forEach(render.call);
				onReady = [];
			}
		}
		var imgs = [
			'images/card-template/background.png',
			'images/card-template/currency-bg.png',
			'images/card-template/currency-border.png',
			'images/card-template/program-bg.png',
			'images/card-template/program-border.png',
			'images/card-template/token-bg.png',
			'images/card-template/token-border.png',
			'images/card-template/action-bg.png',
			'images/card-template/action-border.png',
			'images/card-template/ai-bg.png',
			'images/card-template/ai-border.png',
			'images/card-template/top-border.png',
			'images/card-img.png',
			'images/card-img2.png',
			'images/card-img3.png',
			'images/card-img4.png',
			'images/cards/einstein.png',
			'images/cards/teller.png',
			'images/cards/book.png',
			'images/cards/bolt.png',
			'images/cards/multibolt.png',
			'images/cards/bigbolt.png',
			'images/cards/dome.png',
			'images/cards/enhance.png',
			'images/cards/repair.png',
			'images/cards/khan.png',
			'images/cards/vlad.png'
		];
		var imgMap = {};
		imgs.forEach(function(img){
			imgMap[img] = new createjs.Bitmap(img);
			imgMap[img].image.onload = checkLoaded.apply(this);
		});

		function addBackground(stage) {
			stage.addChild(imgMap['images/card-template/background.png']);
		}

		function addText(stage, card) {
			var titleTxt = new createjs.Text('', '20px Arial', 'black');
			titleTxt.name = 'title-text';
			titleTxt.x = 90;
			titleTxt.y = 30;
			titleTxt.textBaseline = 'alphabetic';
			titleTxt.textAlign = 'center';

			var cardText = new createjs.Text('', '14px Arial', 'black');
			cardText.name = 'card-text';
			cardText.x = 90;
			cardText.y = 230;
			cardText.textBaseline = 'alphabetic';
			cardText.textAlign = 'center';
			
			cardText.text = card.text;
			titleTxt.text = card.name;

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
			stage.addChild(titleTxt,cardText);
		}
		var typeRender = {
			currency: function(stage, card) {
				addBackground(stage);
				stage.addChild(imgMap['images/card-template/currency-bg.png']);
				
				var img = imgMap['images/card-img2.png'];
				img.x = 10;
				img.y = 48;
				stage.addChild(img);
				stage.addChild(imgMap['images/card-template/currency-border.png']);

			},
			program: function(stage, card) {
				addBackground(stage);
				stage.addChild(imgMap['images/card-template/program-bg.png']);
				
				var img = imgMap['images/card-img3.png'];
				img.x = 10;
				img.y = 48;
				stage.addChild(img);
				stage.addChild(imgMap['images/card-template/program-border.png']);
				addText(stage,card);
			},
			token: function(stage, card) {
				addBackground(stage);
				stage.addChild(imgMap['images/card-template/token-bg.png']);
				
				var img = imgMap['images/card-img.png'];
				img.x = 10;
				img.y = 48;

				stage.addChild(img);
				stage.addChild(imgMap['images/card-template/token-border.png']);
				
				addText(stage,card);
				
				var txt = stage.getChildByName('card-text');
				txt.text = card.power + '/' + card.toughness;
				txt.font = 'bold 30px Arial';
				txt.x = 150;
				txt.y = 240;

			},
			action: function(stage, card) {
				addBackground(stage);
				stage.addChild(imgMap['images/card-template/action-bg.png']);
				
				var img = imgMap['images/' + (card.img ? 'cards/' + card.img : 'card-img4.png')];
				img.x = 10;
				img.y = 48;
				stage.addChild(img);
				stage.addChild(imgMap['images/card-template/action-border.png']);
				addText(stage,card);
			},
			ai: function(stage, card) {
				addBackground(stage);
				stage.addChild(imgMap['images/card-template/ai-bg.png']);
				
				var img = imgMap['images/cards/'+card.img];
				img.x = 10;
				img.y = 48;

				stage.addChild(img);
				stage.addChild(imgMap['images/card-template/ai-border.png']);
				
				addText(stage,card);
				var title = stage.getChildByName('title-text');
				title.color = 'white';

				var txt = stage.getChildByName('card-text');
				txt.color = 'white';
				txt.textAlign = 'left';
				txt.x = 15;
				
				
				var newTxt = new createjs.Text('', 'bold 30px Arial', 'white');
				newTxt.name = 'aipt-text';
				newTxt.text = card.power + '/' + card.toughness;
				newTxt.textBaseline = 'alphabetic';
				newTxt.textAlign = 'center';
				newTxt.x = 145;
				newTxt.y = 235;
				stage.addChild(newTxt);
			}
		};

		function render(card, cb, retObj) {
			if (!retObj) { retObj = {img: ''} };
			if (!ready) {
				onReady.push([card,cb,retObj]);
				return retObj;
			}
			var stage = new createjs.Stage(canvas);
			typeRender[card.type](stage, card);
			stage.addChild(imgMap['images/card-template/top-border.png']);
	
			stage.update();
			var data = stage.toDataURL();
			retObj.img = data;
			if (cb) { cb(retObj); }
			return retObj;
		}

		return {
			render: render,
			ready: ready
		};
	}]);
}());