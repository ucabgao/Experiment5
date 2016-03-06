app.config(function($stateProvider) {
	$stateProvider.state('createLevel', {
		url: '/createLevel?levelId',
		// params: {
		// 	levelId: null
		// },
		templateUrl: 'js/states/createLevel/createLevel.html',
		controller: 'CreateLevelCtrl'
	});
});
