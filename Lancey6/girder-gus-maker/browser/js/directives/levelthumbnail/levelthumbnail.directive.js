app.directive('levelThumbnail', function( $state ) {
    return {
        restrict: 'E',
        templateUrl: 'js/directives/levelthumbnail/levelthumbnail.html',
        controller: 'LevelThumbnailCtrl',
        scope: {
            level: '=',
            edit: '='
        },
        link: function( scope ) {
          if ( scope.edit ) scope.linkUrl = $state.href('createLevel', { levelId: scope.level._id });
          else scope.linkUrl = $state.href( "levels.details", { levelId: scope.level._id });

          console.log( scope.linkUrl );
        }
    }
});
