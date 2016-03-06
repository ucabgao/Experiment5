app.factory('LevelsFactory', function($http) {
    return {
        fetchAll: function(params) {
            return $http.get('api/levels', { params: params })
                .then(function(res) {
                    return res.data;
                });
        },
        fetchDrafts: function(params) {
            return $http.get('api/levels/drafts', { params: params })
                .then(function(res) {
                    return res.data;
                });
        },
        fetchById: function(levelId) {
            return $http.get('api/levels/'+levelId)
                .then(function(res) {
                    return res.data;
                });
        }
    }
})