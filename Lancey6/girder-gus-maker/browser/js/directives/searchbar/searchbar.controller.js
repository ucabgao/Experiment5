app.controller('SearchbarCtrl', function($scope, $state) {
    console.log($scope.params);
    var sortIdx = 0;
    for(var i = 0; i < $scope.sorts.length; i++) {
        if($scope.params.sort === $scope.sorts[i].value) {
            sortIdx = i;
        }
    }
    $scope.sort = $scope.sorts[sortIdx];

    if($scope.params.creator === undefined) $scope.searchType = $scope.searchTypes[0];
    else if($scope.params.creator !== undefined) $scope.searchType = $scope.searchTypes[1];
    
    $scope.starBy = $scope.params.sort !== 'starCount' ? 'desc' : $scope.params.by ? $scope.params.by : 'desc';
    $scope.textBy = $scope.params.sort !== 'title' ? 'asc' : $scope.params.by ? $scope.params.by : 'asc';
    $scope.dateBy = $scope.params.sort !== 'dateCreated' ? 'desc' : $scope.params.by ? $scope.params.by : 'desc';

    $scope.search = function() {
        console.log($scope.sort);
        var type = $scope.searchbar.type.$modelValue.value;
        var params = {
            sort: $scope.searchbar.order.$modelValue.value,
            by: $scope.searchbar.order.$modelValue.value === 'title' ? $scope.searchbar.textBy.$modelValue : $scope.searchbar.order.$modelValue.value === 'dateCreated' ? $scope.searchbar.dateBy.$modelValue : $scope.searchbar.order.$modelValue.value === 'starCount' ? $scope.searchbar.starBy.$modelValue : undefined,
            page: undefined,
            limit: undefined
        };
        console.log(params);
        if(type === 'title') {
            params.title = $scope.searchbar.query.$modelValue;
            params.creator = undefined;
        } else if(type === 'creator') {
            params.creator = $scope.searchbar.query.$modelValue;
            params.title = undefined;
        }

        $state.go('levels.list',params, { reload: true });
    }
})