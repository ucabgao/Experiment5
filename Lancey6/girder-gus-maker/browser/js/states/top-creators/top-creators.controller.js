app.controller('TopCreatorsCtrl', function($scope, $state, mostStarred, mostFollowed, mostCreated) {
    $scope.mostStarred = mostStarred;
    $scope.mostFollowed = mostFollowed;
    $scope.mostCreated = mostCreated;
})