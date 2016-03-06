app.controller('BuilderCtrl', function($scope, $state, drafts) {
	$scope.goToCreate = function() {
		$state.go('createLevel');
	}

  var rowSize = 4;
  $scope.drafts = drafts.results.reduce( function( levelMap, level ) {
        if ( levelMap[ levelMap.length - 1 ].length < rowSize ) {
            levelMap[ levelMap.length - 1 ].push( level );
        } else {
            levelMap.push( [level] );
        }
        return levelMap;
    }, [[]] );
});
