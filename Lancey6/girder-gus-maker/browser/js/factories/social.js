app.factory('SocialFactory', function($http) {
    return {
        levelLiker: function(levelId, func) {
            return $http.post('api/levels/like', {
                    args: levelId,
                    func: func
                })
                .then(function(res) {
                    console.log(res);
                    return res.data;
                });
        },
        userFollower: function(userId, func) {
            return $http.post('api/users/follow', {
                    args: userId,
                    func: func
                })
                .then(function(res) {
                    console.log(res);
                    return res.data;
                });
        }
    }
})