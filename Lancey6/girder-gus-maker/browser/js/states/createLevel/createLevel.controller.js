const _ = require('lodash');
const defaultSky = require('../../../../game/js/consts/colors').DEFAULT_SKY;
const eventEmitter = window.eventEmitter

app.controller('CreateLevelCtrl', function($scope, CreateLevelFactory, $state, $stateParams) {
	var nextMapUse = null;
	var unparsedLevelArr = null;
	var parsedLevelArr = [];
	var draftSaveObj;

	$scope.testing = false;
	$scope.error = false;
	var levelId = $stateParams.levelId;
	var sentId = false;
	$scope.readyToSave = true;


	$scope.toolArr = {
		'Eraser' : {
			img : '/assets/images/eraser.png',
	tile: null
		},
	'Gus' : {
		img : '/assets/images/gus-static.png',
	tile: 'Gus'
	},
	'Red Brick' : {
		img : '/assets/images/brick_red.png',
	tile: 'RedBrickBlock'
	},
	'Black Brick' : {
		img : '/assets/images/brick_black.png',
		tile: 'BlackBrickBlock'
	},
	'Break Brick' : {
		img : '/assets/images/brick_break.png',
		tile: 'BreakBrickBlock'
	},
	'Spike': {
		img : '/assets/images/spike.png',
		tile: 'Spike'
	},
	'Tool' : {
		img : '/assets/images/tool.png',
		tile: 'Tool'
	}
	}
	$scope.skyColor = defaultSky;
	$scope.girdersAllowed = 10;

	$scope.activeToolImg = $scope.toolArr['Red Brick'].img;

	$scope.changeActiveTool = function(tool) {
		console.log('changing active tool...')
			eventEmitter.emit('change active tool', tool.tile)
			$scope.activeToolImg = tool.img;
	}

	$scope.requestParsedTileMap = () => {
		nextMapUse = 'log';
		console.log('requesting tile map...');
		eventEmitter.emit('request tile map', '');
	}

	var sendSkyColor = function() {
		console.log( "Sending new sky color" );
		eventEmitter.emit('here\'s sky color', $scope.skyColor);
	}

	$scope.$watch( 'skyColor', function() {
		console.log( "Sky color changed to", $scope.skyColor );
		sendSkyColor();
	}, true );

	eventEmitter.only('need sky color', sendSkyColor);

	eventEmitter.only('game ended', function(data) {
		console.log(data);
		$scope.beaten = true;
		$scope.beatenLevel = parsedLevelArr;
		$scope.$digest();
	});

	eventEmitter.only('send tile map', (mapArr) => {
		if(nextMapUse === 'log') {
			console.log('recieved.');
			console.dir(mapArr);
		} else if (nextMapUse === 'switchToGame') {
			console.log('ready to switch');
			parsedLevelArr = mapArr[0];
			console.log(parsedLevelArr);
			console.log("look above");
			unparsedLevelArr = mapArr[1];
			$scope.testing = true;
		}
	});

	eventEmitter.only('I need both the maps!', function() {
		if(!levelId || sentId) {
			eventEmitter.emit('found maps!', ['levelArr', unparsedLevelArr, parsedLevelArr]);
		} else { 
			sentId = true;
			eventEmitter.emit('found maps!', ['levelId', levelId]);
		}
	});

	$scope.getScreenshot = function() {
		eventEmitter.emit('request screenshot');
	}

	eventEmitter.only('map for draft save', function(data) {
		console.log(data);
		CreateLevelFactory.submitLevel(data, draftSaveObj.levelTitle, draftSaveObj.girdersAllowed, draftSaveObj.skyColor, draftSaveObj.shouldPublish, draftSaveObj.levelId).then(function(data) {
				$scope.error = false;
				$scope.success = true;
				if(draftSaveObj.shouldPublish) {
					$state.go('levels.details', {levelId: data._id});
				}
				console.log(data);
				$scope.readyToSave = true;
			}).then(null, function(err) {
				$scope.error = true;
				$scope.success = false;
				console.error(err);
				$scope.readyToSave = true;
			});
	});


	$scope.submitBeatenLevel = function(levelArrayBeaten, levelTitle, girdersAllowed, skyColor, shouldPublish) {
		$scope.readyToSave = false;
		//shouldPublish indicates if the level is being saved permenantly or simply for future editing
		if(typeof shouldPublish !== 'boolean') shouldPublish = true;
		shouldPublish = shouldPublish || false;
		if(!levelArrayBeaten && !shouldPublish) {
			levelArrayBeaten = parsedLevelArr;
		}
		if(!levelArrayBeaten || !levelTitle) {
			$scope.error = true;
			console.log('something is missing');
			console.log(levelArrayBeaten);
			console.log(levelTitle);
			$scope.readyToSave = true;
			return;
		}
		if(!girdersAllowed) girdersAllowed = 0;
		if(!skyColor) skyColor = '#000000';
		console.log(levelArrayBeaten, levelTitle, girdersAllowed, skyColor, shouldPublish);
		console.log($scope.testing);
		if($scope.testing) {
			console.log('submit based on scope variable');
		CreateLevelFactory.submitLevel(levelArrayBeaten, levelTitle, girdersAllowed, skyColor, shouldPublish, levelId).then(function(data) {
				$scope.error = false;
				$scope.success = true;
				if(shouldPublish) {
					$state.go('levels.details', {levelId: data._id});
				}
				console.log(data);
				$scope.readyToSave = true;
			}).then(null, function(err) {
				$scope.error = true;
				$scope.success = false;
				console.error(err);
				$scope.readyToSave = true;
			});
		} else {
			console.log('going to submit after getting level creator result');
			draftSaveObj = {
				levelTitle: levelTitle,
				girdersAllowed: girdersAllowed,
				skyColor: skyColor,
				shouldPublish: shouldPublish,
				levelId: levelId
			}
			nextMapUse = 'saveGameProgress';
			eventEmitter.emit('request tile map for draft save', '');
		}
	}

	$scope.stopInputCapture = function() {
		eventEmitter.emit('stop input capture');
	}

	$scope.startInputCapture = function() {
		eventEmitter.emit('start input capture');
	}

	$scope.testTesting = function() {
		nextMapUse = 'switchToGame';
		$scope.activeToolImg = $scope.toolArr['Red Brick'].img;
		if(!$scope.testing) {
			eventEmitter.emit('request tile map', '');
		} else {
			$scope.testing = !$scope.testing;
			$scope.beatenLevel = null;
			$scope.beaten = false;
		}

		window.game.destroy();

		(function checkGameDestroyed() {
			if ( window.game.isBooted === false ) {
				window.game = null;
			} else {
				setTimeout( checkGameDestroyed, 100 );
			}
		})()
	}

	eventEmitter.only('send screenshot', (screenshot) => {
		console.log('screenshot');
		console.log(screenshot);
	})

	eventEmitter.only('what level to play', (data) => {
		console.log(data);
		if(parsedLevelArr) {
			eventEmitter.emit('play this level', ['levelArr', {
				levelArr: parsedLevelArr,
				skyColor: $scope.skyColor,
				girdersAllowed: $scope.girdersAllowed
			}]);
			console.log('found a parsed level arr');
		} else {
			console.log(parsedLevelArr);
		}
	});
});
