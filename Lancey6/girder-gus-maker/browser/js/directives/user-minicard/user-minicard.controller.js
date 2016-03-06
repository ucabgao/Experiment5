app.controller('UserMinicardCtrl', function($scope, SocialFactory) {
    $scope.followed = (function() {
        if($scope.user !== null) {
            return $scope.user.following.indexOf($scope.creator._id) !== -1;
        } else return false;
    })();
    $scope.pending = false;

    $scope.followCreator = function() {
        if($scope.user !== null) {
            $scope.pending = true;
            SocialFactory.userFollower($scope.creator._id, 'followUser')
                .then(function(res) {
                    $scope.creator.totalFollowers = res.creator.totalFollowers;
                    $scope.followed = res.user.following.indexOf($scope.creator._id) !== -1;
                    $scope.pending = false;
                })
        }
    }

    $scope.unfollowCreator = function() {
        if($scope.user !== null) {
            $scope.pending = true;
            SocialFactory.userFollower($scope.creator._id, 'unfollowUser')
                .then(function(res) {
                    $scope.creator.totalFollowers = res.creator.totalFollowers;
                    $scope.followed = res.user.following.indexOf($scope.creator._id) !== -1;
                    $scope.pending = false;
                })
        }
    }
});