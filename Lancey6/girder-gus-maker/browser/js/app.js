'use strict';

require('angular');
require('angular-ui-router');

require('./misc/fsa-pre-built');
require('./misc/ng-load-script');

const events = require('events');
var eventEmitter = new events.EventEmitter();

eventEmitter.only = function( event, callback ) {
    this.removeAllListeners( event );
    return this.on( event, callback );
}

eventEmitter.on('loaded', () => { console.log('\n\ncreator loaded\n\n') })

window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ngLoadScript']);
window.eventEmitter = eventEmitter; // for communication with levelCreator

window.app.config(function($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
    $urlRouterProvider.when('/auth/:provider', function() {
        window.location.reload();
    })
});

// This app.run is for controlling access to specific states.
window.app.run(function($rootScope, AuthService, $state) {
    // The given state requires an authenticated user.
    var destinationStateRequiresAuth = function(state) {
        return state.data && state.data.authenticate;
    };

    // $stateChangeStart is an event fired
    // whenever the process of changing a state begins.
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {

        // clear out the game in memory if it's there
        if ( window.game ) {
            console.log( "Cleaning up old game..." );
            window.game.destroy();
            //window.game = null;
        }

        // remove events from our emitter
        eventEmitter.removeAllListeners( 'what level to play' )
                    .removeAllListeners( 'play this level' );

        if (!destinationStateRequiresAuth(toState)) {
            // The destination state does not require authentication
            // Short circuit with return.
            return;
        }

        if (AuthService.isAuthenticated()) {
            // The user is authenticated.
            // Short circuit with return.
            return;
        }

        // Cancel navigating to new state.
        event.preventDefault();

        AuthService.getLoggedInUser().then(function(user) {
            // If a user is retrieved, then renavigate to the destination
            // (the second time, AuthService.isAuthenticated() will work)
            // otherwise, if no user is logged in, go to "login" state.
            if (user) {
                $state.go(toState.name, toParams);
            } else {
                $state.go('login');
            }
        });

    });

});


require('./directives');
require('./states');
require('./factories');
