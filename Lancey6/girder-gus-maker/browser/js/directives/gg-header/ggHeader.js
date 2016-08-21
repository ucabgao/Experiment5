app.directive('ggHeader', ($rootScope, AuthService, AUTH_EVENTS, $state) => {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'js/directives/gg-header/gg-header.html',
    link: (scope) => {
      scope.menuItems = [
        { title: 'Levels', state: 'levels.list' },
        { title: 'Builder', state: 'builder' },
        { title: 'Top Creators', state: 'topCreators' },
        { title: 'Stuff', state: 'stuff' }
      ];

      scope.user = null;

      scope.isLoggedIn = () => AuthService.isAuthenticated();

      scope.logout = () => (
        AuthService.logout()
        .then(() => { $state.go('home') })
      );

	  scope.stateChange = function(targetState) {
		  if(targetState === 'builder') {
			  if($rootScope.user) $state.go(targetState);
			  else $rootScope.promptUser = true;
		  } else {
        $state.go(targetState);
      }
	  }

      const setUser = () => {
        AuthService.getLoggedInUser()
        .then((user) => { scope.user = user; })
      };

      const removeUser = () => { scope.user = null };

      setUser();

      $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
      $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
      $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);

    }
  }
})
