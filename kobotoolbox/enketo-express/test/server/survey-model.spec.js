/* global describe, require, it, before, after, beforeEach, afterEach */
"use strict";

// safer to ensure this here (in addition to grunt:env:test)
process.env.NODE_ENV = 'test';

var _wait1ms,
    Promise = require( "q" ).Promise,
    chai = require( "chai" ),
    expect = chai.expect,
    chaiAsPromised = require( "chai-as-promised" ),
    redis = require( "redis" ),
    config = require( "../../app/models/config-model" ).server,
    model = require( '../../app/models/survey-model' ),
    client = redis.createClient( config.redis.main.port, config.redis.main.host, {
        auth_pass: config.redis.main.password
    } );

chai.use( chaiAsPromised );

// help function to ensure subsequent database entries don't have the exact same timestamp
// redis is fast...
_wait1ms = function() {
    return new Promise( function( resolve ) {
        setTimeout( function() {
            resolve();
        }, 1 );
    } );
};

describe( 'Survey Model', function() {

    afterEach( function( done ) {
        // select test database and flush it
        client.select( 15, function( err ) {
            if ( err ) {
                return done( err );
            }
            client.flushdb( function( err ) {
                if ( err ) {
                    return done( err );
                }
                done();
            } );
        } );
    } );

    describe( 'set: when attempting to store new surveys', function() {
        var survey;

        beforeEach( function() {
            survey = {
                openRosaId: 'widgets',
                openRosaServer: 'https://ona.io/enketo'
            };
        } );

        it( 'returns an error if the OpenRosa Server is missing', function() {
            delete survey.openRosaServer;
            return expect( model.set( survey ) ).to.eventually.be.rejected;
        } );

        it( 'returns an error if the OpenRosa Form ID is missing', function() {
            delete survey.openRosaId;
            return expect( model.set( survey ) ).to.eventually.be.rejected;
        } );

        it( 'returns an error if the OpenRosa Form ID is an empty string', function() {
            survey.openRosaId = '';
            return expect( model.set( survey ) ).to.eventually.be.rejected;
        } );

        it( 'returns an error if the OpenRosa Server is an empty string', function() {
            survey.openRosaServer = '';
            return expect( model.set( survey ) ).to.eventually.be.rejected;
        } );

        it( 'returns an enketo id if succesful', function() {
            // the algorithm for the very first survey to be created returns YYYp
            return expect( model.set( survey ) ).to.eventually.equal( 'YYYp' );
        } );

        it( 'returns a different enketo id if the capitalization of the OpenRosa Form ID changes', function() {
            var surveyDifferent = {
                openRosaId: 'Survey',
                openRosaServer: survey.openRosaServer
            };
            // the algorithm for the second survey to be created returns YYY8
            return Promise.all( [
                expect( model.set( survey ) ).to.eventually.equal( 'YYYp' ),
                expect( model.set( surveyDifferent ) ).to.eventually.equal( 'YYY8' ),
            ] );
        } );

        it( 'returns an enketo id when the survey includes a theme property', function() {
            survey.theme = 'gorgeous';
            return expect( model.set( survey ) ).to.eventually.equal( 'YYYp' );
        } );

        it( 'drops nearly simultaneous set requests to avoid db corruption', function() {
            return Promise.all( [
                expect( model.set( survey ) ).to.eventually.equal( 'YYYp' ),
                expect( model.set( survey ) ).to.eventually.be.rejected,
                expect( model.set( survey ) ).to.eventually.be.rejected
            ] );
        } );
    } );

    describe( 'get: when attempting to obtain a survey', function() {
        it( 'returns an error when survey does not exist', function() {
            return expect( model.get( 'nonexisting' ) ).to.eventually.be.rejected;
        } );

        it( 'returns the survey object when survey exists', function() {
            var survey = {
                    openRosaId: 'test',
                    openRosaServer: 'https://ona.io/enketo'
                },
                getSurveyPromise = model.set( survey ).then( model.get );
            return Promise.all( [
                expect( getSurveyPromise ).to.eventually.have.property( 'openRosaId' ).and.to.equal( survey.openRosaId ),
                expect( getSurveyPromise ).to.eventually.have.property( 'openRosaServer' ).and.to.equal( survey.openRosaServer )
            ] );
        } );

        it( 'returns the survey object with a theme parameter when this exists', function() {
            var survey = {
                    openRosaId: 'test',
                    openRosaServer: 'https://ona.io/enketo',
                    theme: 'gorgeous'
                },
                getSurveyPromise = model.set( survey ).then( model.get );
            return expect( getSurveyPromise ).to.eventually.have.property( 'theme' ).and.to.equal( survey.theme );
        } );

        it( 'returns the survey object with an empty string as theme property if the theme is undefined', function() {
            var survey = {
                    openRosaId: 'test',
                    openRosaServer: 'https://ona.io/enketo'
                },
                getSurveyPromise = model.set( survey ).then( model.get );
            return expect( getSurveyPromise ).to.eventually.have.property( 'theme' ).and.to.equal( '' );
        } );
    } );

    describe( 'update: when updating an existing survey', function() {
        var survey;

        beforeEach( function() {
            survey = {
                openRosaId: 'test',
                openRosaServer: 'https://ona.io/enketo'
            };
        } );

        it( 'it returns an error when the parameters are incorrect', function() {
            var promise1 = model.set( survey ),
                promise2 = promise1.then( function() {
                    survey.openRosaId = '';
                    //change to http
                    survey.openRosaServer = 'http://ona.io/enketo';
                    return model.update( survey );
                } ).then( model.get );
            return Promise.all( [
                expect( promise1 ).to.eventually.have.length( 4 ),
                expect( promise2 ).to.eventually.be.rejected
            ] );
        } );

        it( 'returns the (protocol) edited survey object when succesful', function() {
            var promise = model.set( survey ).then( function() {
                //change to http
                survey.openRosaServer = 'http://ona.io/enketo';
                return model.update( survey );
            } ).then( model.get );
            return Promise.all( [
                expect( promise ).to.eventually.have.property( 'openRosaId' ).and.to.equal( survey.openRosaId ),
                expect( promise ).to.eventually.have.property( 'openRosaServer' ).and.to.equal( 'http://ona.io/enketo' )
            ] );
        } );

        it( 'returns the (theme added) edited survey object when succesful', function() {
            var promise = model.set( survey ).then( function() {
                // add theme
                survey.theme = 'gorgeous';
                return model.update( survey );
            } ).then( model.get );
            return Promise.all( [
                expect( promise ).to.eventually.have.property( 'openRosaId' ).and.to.equal( survey.openRosaId ),
                expect( promise ).to.eventually.have.property( 'openRosaServer' ).and.to.equal( survey.openRosaServer ),
                expect( promise ).to.eventually.have.property( 'theme' ).and.to.equal( 'gorgeous' )
            ] );
        } );

        it( 'returns the (theme: "") edited survey object when succesful',
            function() {
                var promise;

                survey.theme = 'gorgeous';
                promise = model.set( survey ).then( function() {
                    survey.theme = '';
                    return model.update( survey );
                } ).then( model.get );
                return expect( promise ).to.eventually.have.property( 'theme' ).and.to.equal( '' );
            } );

        it( 'returns the (theme: undefined) edited survey object when succesful', function() {
            var promise;

            survey.theme = 'gorgeous';
            promise = model.set( survey ).then( function() {
                delete survey.theme;
                return model.update( survey );
            } ).then( model.get );
            return expect( promise ).to.eventually.have.property( 'theme' ).and.to.equal( '' );
        } );

        it( 'returns the (theme: null) edited survey object when succesful', function() {
            var promise;

            survey.theme = 'gorgeous';
            promise = model.set( survey ).then( function() {
                survey.theme = null;
                return model.update( survey );
            } ).then( model.get );
            return expect( promise ).to.eventually.have.property( 'theme' ).and.to.equal( '' );
        } );

        it( 'returns the (protocol) edited survey object when succesful and called via set()', function() {
            var promise = model.set( survey ).then( function() {
                // change to http
                survey.openRosaServer = 'http://ona.io/enketo';
                // set again
                return model.set( survey );
            } ).then( model.get );
            return Promise.all( [
                expect( promise ).to.eventually.have.property( 'openRosaId' ).and.to.equal( survey.openRosaId ),
                expect( promise ).to.eventually.have.property( 'openRosaServer' ).and.to.equal( 'http://ona.io/enketo' )
            ] );
        } );

        it( 'returns the (theme) edited survey object when succesful and called via set()', function() {
            var promise = model.set( survey ).then( function() {
                // change theme
                survey.theme = 'different';
                // set again
                return model.set( survey );
            } ).then( model.get );
            return Promise.all( [
                expect( promise ).to.eventually.have.property( 'openRosaId' ).and.to.equal( survey.openRosaId ),
                expect( promise ).to.eventually.have.property( 'openRosaServer' ).and.to.equal( survey.openRosaServer ),
                expect( promise ).to.eventually.have.property( 'theme' ).and.to.equal( 'different' ),
            ] );
        } );

    } );

    describe( 'getId: when obtaining the enketo ID', function() {
        var survey = {
            openRosaId: 'existing',
            openRosaServer: 'https://ona.io/enketo'
        };

        it( 'of an existing survey, it returns the id', function() {
            var promise1 = model.set( survey ),
                promise2 = promise1.then( function() {
                    return model.getId( survey );
                } );
            return Promise.all( [
                expect( promise1 ).to.eventually.equal( 'YYYp' ),
                expect( promise2 ).to.eventually.equal( 'YYYp' )
            ] );
        } );

        it( 'of an existing survey, it returns null if the id does not have a case-sensitive match', function() {
            var promise1 = model.set( survey ),
                promise2 = promise1.then( function() {
                    survey.openRosaId = 'Existing';
                    return model.getId( survey );
                } );
            return Promise.all( [
                expect( promise1 ).to.eventually.equal( 'YYYp' ),
                expect( promise2 ).to.eventually.be.fulfilled.and.deep.equal( null )
            ] );
        } );

        it( 'of a non-existing survey, it returns null', function() {
            survey.openRosaId = 'non-existing';

            var promise = model.getId( survey );
            return expect( promise ).to.eventually.be.fulfilled.and.deep.equal( null );
        } );

        it( 'of a survey with incorrect parameters, it returns a 400 error', function() {
            survey.openRosaId = null;
            var promise = model.getId( survey );
            return expect( promise ).to.eventually.be.rejected.and.have.property( 'status' ).that.equals( 400 );
        } );
    } );


    describe( 'getNumber', function() {
        var server = 'https://kobotoolbox.org/enketo',
            survey1 = {
                openRosaId: 'a',
                openRosaServer: server
            },
            survey2 = {
                openRosaId: 'b',
                openRosaServer: server
            };

        it( 'obtains the number of surveys if all are active', function() {
            var getNumber = model.set( survey1 )
                .then( function() {
                    return model.set( survey2 );
                } )
                .then( function() {
                    return model.getNumber( server );
                } );
            return expect( getNumber ).to.eventually.equal( 2 );
        } );

        it( 'obtains the number of active surveys only', function() {
            var getNumber = model.set( survey1 )
                .then( function() {
                    return model.set( survey2 );
                } )
                .then( function() {
                    return model.update( {
                        openRosaServer: server,
                        openRosaId: survey1.openRosaId,
                        active: false
                    } );
                } )
                .then( function() {
                    return model.getNumber( server );
                } );
            return expect( getNumber ).to.eventually.equal( 1 );
        } );
    } );

    describe( 'getList', function() {
        var server = 'https://kobotoolbox.org/enketo',
            survey1 = {
                openRosaId: 'a',
                openRosaServer: server
            },
            survey2 = {
                openRosaId: 'b',
                openRosaServer: server
            };

        it( 'obtains the list surveys if all are active in ascending launch date order', function() {
            var getList = model.set( survey1 )
                .then( _wait1ms )
                .then( function() {
                    return model.set( survey2 );
                } )
                .then( function() {
                    return model.getList( server );
                } );
            return expect( getList ).to.eventually.deep.equal( [ {
                openRosaServer: server,
                enketoId: 'YYYp',
                openRosaId: 'a'
            }, {
                openRosaServer: server,
                enketoId: 'YYY8',
                openRosaId: 'b'
            } ] );
        } );

        it( 'obtains the list of active surveys only', function() {
            var getList = model.set( survey1 )
                .then( _wait1ms )
                .then( function() {
                    return model.set( survey2 );
                } )
                .then( function() {
                    return model.update( {
                        openRosaServer: server,
                        openRosaId: survey1.openRosaId,
                        active: false
                    } );
                } )
                .then( function() {
                    return model.getList( server );
                } );
            return expect( getList ).to.eventually.deep.equal( [ {
                openRosaServer: server,
                enketoId: 'YYY8',
                openRosaId: 'b'
            } ] );
        } );
    } );

} );
