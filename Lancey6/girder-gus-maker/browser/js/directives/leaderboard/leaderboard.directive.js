app.directive('leaderboard', function() {
    return {
        restrict: 'E',
        templateUrl: 'js/directives/leaderboard/leaderboard.html',
        scope: {
            userType: '=',
            achievement: '=',
            list: '=',
            select: '='
        },
        controller: 'LeaderboardCtrl'
    }
})