app.directive( "levelCreator", function() {

  return {
    restrict: 'E',
    templateUrl: '/js/directives/level-creator/level-creator.html',
    scope: {
      level: '=',
      state: '='
    }
  }

});
