window.app.config(function ($stateProvider) {
    $stateProvider.state('levels.details', {
        url: '/:levelId',
        templateUrl: 'js/states/levelDetails/level-details.html',
        controller: 'LevelDetailsCtrl',
        resolve: {
            data: function(LevelsFactory, $stateParams) {
                return LevelsFactory.fetchById($stateParams.levelId);
            },
            user: function(AuthService) {
                return AuthService.getLoggedInUser();
            }
        },
        link: function(s, e, a) {
        }
    });
});