window.app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/states/login/login.html',
        controller: 'LoginCtrl'
    });

});
