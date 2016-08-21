window.app.config(function ($stateProvider) {
    $stateProvider.state('levels', {
        abstract: true,
        url: '/levels',
        template: '<ui-view />'
    }).state('levels.list', {
        url: '?title&creator&starCount&sort&by&limit&page',
        templateUrl: 'js/states/levels/levels.html',
		controller: 'LevelsCtrl',
        resolve: {
            data: function(LevelsFactory, $stateParams) {
                return LevelsFactory.fetchAll($stateParams);
            }
        },
		link: function(s, e, a) {
		}
    });
});