const eventEmitter = window.eventEmitter

app.controller('LevelDetailsCtrl', function ($scope, $state, data, user, SocialFactory) {
    if ( data ) {
        $scope.level = {
            _id: data._id,
            dateCreated: data.dateCreated,
            starCount: data.starCount,
            title: data.title
        };
        $scope.creator = data.creator;
        $scope.liked = (function() {
            if(user !== null) {
                console.log('liked',user.likedLevels.indexOf(data._id));
                return user.likedLevels.indexOf(data._id) !== -1;
            } else return false;
        })();
    }
    console.log('data',data);
    $scope.user = user;
    $scope.pending = false;

    $scope.starLevel = function() {
        if(user !== null) {
            $scope.pending = true;
            SocialFactory.levelLiker(data._id,'likeLevel')
                .then(function(res) {
                    console.log(res);
                    $scope.level.starCount = res.level.starCount;
                    $scope.creator.totalStars = res.creator.totalStars;
                    $scope.liked = res.user.likedLevels.indexOf(data._id) !== -1;
                    $scope.pending = false;
                });
        }
    }

    $scope.unstarLevel = function() {
        if(user !== null) {
            $scope.pending = true;
            SocialFactory.levelLiker(data._id,'unlikeLevel')
                .then(function(res) {
                    console.log(res);
                    $scope.level.starCount = res.level.starCount;
                    $scope.creator.totalStars = res.creator.totalStars;
                    $scope.liked = res.user.likedLevels.indexOf(data._id) !== -1;
                    $scope.pending = false;
                });
        }
    }

	$scope.edit = function() {
		$state.go('createLevel', {levelId: $scope.level._id});
	}

    eventEmitter.on('what level to play', (data) => {
        var whatToPlay = ['notFound'];
        if ($scope.level._id) whatToPlay = ['levelId', $scope.level._id];
        eventEmitter.emit('play this level', whatToPlay);
    });
});
