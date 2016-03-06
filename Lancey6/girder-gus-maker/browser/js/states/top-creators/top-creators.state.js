app.config(function($stateProvider) {
    $stateProvider.state('topCreators', {
        url: '/topcreators',
        templateUrl: 'js/states/top-creators/top-creators.html',
        controller: 'TopCreatorsCtrl',
        resolve: {
            mostStarred: function(UsersFactory) {
                return UsersFactory.fetchAll({
                    sort: 'totalStars',
                    by: 'desc',
                    limit: 25
                })
                .then(function(data) {
                    return data.results;
                });
            },
            mostFollowed: function(UsersFactory) {
                return UsersFactory.fetchAll({
                    sort: 'totalFollowers',
                    by: 'desc',
                    limit: 25
                })
                .then(function(data) {
                    return data.results;
                })
            },
            mostCreated: function(UsersFactory) {
                return UsersFactory.fetchAll({
                    sort: 'totalCreatedLevels',
                    by: 'desc',
                    limit: 25
                })
                .then(function(data) {
                    return data.results;
                })
            }
        }
    });
});