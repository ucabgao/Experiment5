'use strict';

var config = require( '../models/config-model' );
var express = require( 'express' );
var router = express.Router();
var debug = require( 'debug' )( 'config-controller' );

module.exports = function( app ) {
    app.use( '/client-config.json', router );
};

router
    .get( '/', function( req, res, next ) {
        res.json( config.client );
    } );
