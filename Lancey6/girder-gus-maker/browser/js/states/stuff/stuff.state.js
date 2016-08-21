app.config(function($stateProvider) {
    $stateProvider.state('stuff', { 
        url: '/stuff',
        templateUrl: '/js/states/stuff/stuff.html',
        controller: 'StuffCtrl'
    });
});