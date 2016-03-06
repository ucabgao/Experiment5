app.controller('LeaderboardCtrl', function($scope) {
    var countTypes = {
        totalStars: 'star-count glyphicon glyphicon-star',
        totalFollowers: 'follower-count glyphicon glyphicon-user',
        totalCreatedLevels: 'levels-count glyphicon glyphicon-picture',
    };
    $scope.countType = countTypes[$scope.select];
    
    $scope.list = $scope.list.map(function(item) {
        return {
            _id: item._id,
            name: item.name,
            topField: item[$scope.select]
        };
    });
});