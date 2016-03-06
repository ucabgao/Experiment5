app.controller('ProfileCtrl', function($scope, profile, UsersFactory) {
    var rowSize = 4;
    var makeRows = function(levels) {
        return levels.reduce( function( levelMap, level ) {
            if ( levelMap[ levelMap.length - 1 ].length < rowSize ) {
                levelMap[ levelMap.length - 1 ].push( level );
            } else {
                levelMap.push( [level] );
            }
            return levelMap;
        }, [[]] );
    }
    var makePages = function(count) {
        var arr = [];
        for(var i = 1; i <= count; i++) {
            arr.push(i);
        }
        return arr;
    }

    $scope.user = profile.user;
    $scope.pages = {
        createdLevels: makePages(profile.createdLevels.pages),
        followingLevels: makePages(profile.followingLevels.pages),
        likedLevels: makePages(profile.likedLevels.pages)
    };
    $scope.currentPage = {
        createdLevels: 1,
        followingLevels: 1,
        likedLevels: 1
    };

    $scope.createdLevels = makeRows(profile.createdLevels.levels);
    $scope.followingLevels = makeRows(profile.followingLevels.levels);
    $scope.likedLevels = makeRows(profile.likedLevels.levels);

    $scope.loadCreatedPages = function(page) {
        UsersFactory.fetchProfileLevels('created', page)
            .then(function(data) {
                console.log(data);
                $scope.createdLevels = makeRows(data.levels);
                $scope.currentPage.createdLevels = page;
            })
    };
    $scope.loadFollowingPages = function(page) {
        UsersFactory.fetchProfileLevels('following', page)
            .then(function(data) {
                console.log(data);
                $scope.followingLevels = makeRows(data.levels);
                $scope.currentPage.followingLevels = page;
            })
    };
    $scope.loadLikedPages = function(page) {
        UsersFactory.fetchProfileLevels('liked', page)
            .then(function(data) {
                console.log(data);
                $scope.likedLevels = makeRows(data.levels);
                $scope.currentPage.likedLevels = page;
            })
    };

    var a = angular.element(document.querySelector('nav a'));
    a.on('click', function(e) {
        e.preventDefault();
    });

})