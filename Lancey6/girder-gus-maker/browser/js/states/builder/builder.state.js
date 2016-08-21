app.config(function ($stateProvider) {
    $stateProvider.state('builder', {
        url: '/builder',
        templateUrl: 'js/states/builder/builder.html',
    		controller: 'BuilderCtrl',
        resolve: {
            drafts: function(LevelsFactory, $stateParams) {
                return LevelsFactory.fetchDrafts($stateParams);
            }
        },
    });
});
