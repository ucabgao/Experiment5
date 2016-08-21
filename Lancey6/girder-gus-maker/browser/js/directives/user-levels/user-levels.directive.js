app.directive('userLevels', function() {
    return {
        restrict: 'E',
        templateUrl: 'js/directives/user-levels/user-levels.html',
        controller: 'UserLevelsCtrl',
        scope: {
            levels: '='
        },
        link: function(scope) {

        }
    }
})
