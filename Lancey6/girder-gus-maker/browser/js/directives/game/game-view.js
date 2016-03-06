app.directive( "gameView", function() {

  return {
    restrict: 'E',
    templateUrl: '/js/directives/game/game-view.html',
    scope: {
      level: '=',
      state: '='
    },
    link: function() {
      const eventEmitter = window.eventEmitter;
      eventEmitter.emit( "start input capture" );
    }
  }

});
