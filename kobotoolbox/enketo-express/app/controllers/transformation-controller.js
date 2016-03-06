'use strict';

var Promise = require( 'q' ).Promise;
var transformer = require( 'enketo-transformer' );
var communicator = require( '../lib/communicator' );
var surveyModel = require( '../models/survey-model' );
var cacheModel = require( '../models/cache-model' );
var account = require( '../models/account-model' );
var user = require( '../models/user-model' );
var isArray = require( 'lodash/lang/isArray' );
var express = require( 'express' );
var router = express.Router();
var debug = require( 'debug' )( 'transformation-controller' );

module.exports = function( app ) {
    app.use( '/transform', router );
};

router
    .post( '*', function( req, res, next ) {
        // set content-type to json to provide appropriate json Error responses
        res.set( 'Content-Type', 'application/json' );
        next();
    } )
    .post( '/xform', getSurveyParts )
    .post( '/xform/hash', getCachedSurveyHash );

/**
 * Obtains HTML Form, XML model, and existing XML instance
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function getSurveyParts( req, res, next ) {
    var surveyBare;

    _getSurveyParams( req.body )
        .then( function( survey ) {

            // for external authentication, pass the cookie(s)
            survey.cookie = req.headers.cookie;
            // for OpenRosa authentication, add the credentials
            survey.credentials = user.getCredentials( req );
            // store a copy of the bare survey object
            surveyBare = JSON.parse( JSON.stringify( survey ) );

            if ( survey.info ) {
                _getFormDirectly( survey )
                    .then( function( survey ) {
                        _respond( res, survey );
                    } )
                    .catch( next );
            } else {
                _authenticate( survey )
                    .then( _getFormFromCache )
                    .then( function( result ) {
                        if ( result ) {
                            // immediately serve from cache without first checking for updates
                            _respond( res, result );
                            // update cache if necessary, asynchronously AFTER responding
                            // This is the ONLY mechanism by with an online-only form will be updated
                            _updateCache( surveyBare );
                        } else {
                            _updateCache( surveyBare )
                                .then( function( survey ) {
                                    _respond( res, survey );
                                } )
                                .catch( next );
                        }
                    } )
                    .catch( next );
            }
        } )
        .catch( next );
}

/**
 * Obtains the hash of the cached Survey Parts
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function getCachedSurveyHash( req, res, next ) {
    var s;
    _getSurveyParams( req.body )
        .then( function( survey ) {
            s = survey;
            return cacheModel.getHashes( survey );
        } )
        .then( function( result ) {
            _respond( res, result );
            // update cache if necessary, asynchronously AFTER responding
            // this is the ONLY mechanism by which a locally browser-stored form
            // will be updated
            _updateCache( s );
        } )
        .catch( next );
}

function _getFormDirectly( survey ) {
    return communicator.getXForm( survey )
        .then( _addMediaMap )
        .then( transformer.transform );
}

function _authenticate( survey ) {
    return communicator.authenticate( survey );
}

function _getFormFromCache( survey ) {
    return cacheModel.get( survey );
}

/**
 * Update the Cache if necessary.
 * @param  {[type]} survey [description]
 */
function _updateCache( survey ) {
    return communicator.getXFormInfo( survey )
        .then( communicator.getManifest )
        .then( cacheModel.check )
        .then( function( upToDate ) {
            if ( !upToDate ) {
                return _getFormDirectly( survey )
                    .then( cacheModel.set );
            }
        } )
        .catch( function( error ) {
            if ( error.status === 401 || error.status === 404 ) {
                cacheModel.flush( survey );
            } else {
                console.error( 'Unknown Error occurred during attempt to update cache', error );
            }

            throw error;
        } );
}

/**
 * Adds a media map, see enketo/enketo-transformer
 * 
 * @param {[type]} survey [description]
 */
function _addMediaMap( survey ) {
    var mediaMap = null;

    return new Promise( function( resolve, reject ) {
        if ( isArray( survey.manifest ) ) {
            survey.manifest.forEach( function( file ) {
                mediaMap = mediaMap ? mediaMap : {};
                if ( file.downloadUrl ) {
                    mediaMap[ file.filename ] = _toLocalMediaUrl( file.downloadUrl );
                }
            } );
        }
        survey.media = mediaMap;
        resolve( survey );
    } );
}

/**
 * Converts a url to a local (proxied) url.
 *
 * @param  {string} url The url to convert.
 * @return {string}     The converted url.
 */
function _toLocalMediaUrl( url ) {
    var localUrl = '/media/get/' + url.replace( /(https?):\/\//, '$1/' );
    return localUrl;
}

function _respond( res, survey ) {

    delete survey.credentials;

    res.status( 200 );
    res.send( {
        form: survey.form,
        // previously this was JSON.stringified, not sure why
        model: survey.model,
        theme: survey.theme,
        // The hash components are converted to deal with a node_redis limitation with storing and retrieving null.
        // If a form contains no media this hash is null, which would be an empty string upon first load.
        // Subsequent cache checks will however get the value 'null' causing the form cache to be unnecessarily refreshed
        // on the client.
        hash: [ String( survey.formHash ), String( survey.mediaHash ), String( survey.xslHash ), String( survey.theme ) ].join( '-' )
    } );
}

function _getSurveyParams( params ) {
    var error;
    var cleanId;

    if ( params.enketoId ) {
        return surveyModel.get( params.enketoId )
            .then( account.check );
    } else if ( params.serverUrl && params.xformId ) {
        return account.check( {
            openRosaServer: params.serverUrl,
            openRosaId: params.xformId
        } );
    } else {
        return new Promise( function( resolve, reject ) {
            if ( params.xformUrl ) {
                // do not check account
                resolve( {
                    info: {
                        downloadUrl: params.xformUrl
                    }
                } );
            } else {
                error = new Error( 'Bad Request. Survey information not complete.' );
                error.status = 400;
                reject( error );
            }
        } );
    }
}
