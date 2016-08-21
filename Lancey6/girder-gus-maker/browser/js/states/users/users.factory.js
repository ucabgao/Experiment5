app.factory('UsersFactory', function($http) {
    return {
        fetchAll: function(params) {
            return $http.get('api/users', { params: params })
                .then(function(res) {
                    return res.data;
                })
        },
        fetchById: function(id) {
            return $http.get('api/users/'+id)
                .then(function(res) {
                    return res.data;
                })
        },
        fetchOwnProfile: function() {
            return $http.get('api/users/profile')
                .then(function(res) {
                    return res.data;
                })
        },
        fetchProfileLevels: function(levelType, page) {
            return $http.get('api/users/profile/levels', {
                params: {
                    levelType: levelType,
                    page: page
                }
            })
            .then(function(res) {
                return res.data;
            })
        }
    }
})