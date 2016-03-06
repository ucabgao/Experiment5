app.controller('LevelsCtrl', function ($scope, $document, AuthService, $state, data, $stateParams) {
    var rowSize = 4;
    console.log( "ROWSIZE:", rowSize );
	$scope.levels = data.results.reduce( function( levelMap, level ) {
        if ( levelMap[ levelMap.length - 1 ].length < rowSize ) {
            levelMap[ levelMap.length - 1 ].push( level );
        } else {
            levelMap.push( [level] );
        }
        return levelMap;
    }, [[]] );
    $scope.pages = [];
    for(var i = 1; i <= data.pages; i++) {
        $scope.pages.push(i);
    }
    $scope.sorts = [{ title: 'Date Created', value: 'dateCreated'},{ title: 'Title', value: 'title' },{ title: 'Star Count', value: 'starCount'}];
    $scope.searchTypes = [{ title: 'Title', value: 'title'},{title: 'Creator', value: 'creator'}];
    $scope.currentPage = $stateParams.page !== undefined ? parseInt($stateParams.page) : 1;
    $scope.params = $stateParams;

    $scope.toPage = function(page) {
        var params = $stateParams;
        params.page = page;
        if(page > 0 && page <= $scope.pages.length && page !== $scope.currentPage) {
            $state.go('.', params, { reload: true });
        }
    };
});
