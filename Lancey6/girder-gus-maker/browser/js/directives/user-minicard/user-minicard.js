app.directive( "userMinicard", function() {

  return {
    restrict: 'E',
    templateUrl: '/js/directives/user-minicard/user-minicard.html',
    scope: {
      creator: '=',
      user: '='
    },
    controller: 'UserMinicardCtrl'
  }

});
