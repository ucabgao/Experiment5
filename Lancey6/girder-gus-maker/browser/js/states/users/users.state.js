app.config(function ($stateProvider) {

    $stateProvider.state('users', {
        url: '/users?name&email&totalStars&sort&by&limit&page',
        templateUrl: 'js/states/users/users.html',
        controller: 'UsersCtrl',
        resolve: {
            data: function(UsersFactory, $stateParams) {
                return UsersFactory.fetchAll($stateParams);
            }
        }
    });

});
