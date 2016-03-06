app.config(function($stateProvider) {
    $stateProvider.state('profile', {
        url: '/profile',
        templateUrl: 'js/states/profile/profile.html',
        controller: 'ProfileCtrl',
        resolve: {
            profile: function(UsersFactory) {
                return UsersFactory.fetchOwnProfile();
            }
        }
    })
})