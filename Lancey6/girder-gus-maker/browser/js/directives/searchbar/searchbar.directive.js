app.directive('searchbar', function() {
    return {
        restrict: 'E',
        templateUrl: 'js/directives/searchbar/searchbar.html',
        controller: 'SearchbarCtrl',
        scope: {
            'sorts': '=',
            'searchTypes': '=',
            'params': '='
        }
    }
});