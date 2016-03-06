'use strict';

var libxml = require( "libxmljs" );
var url = require( 'url' );
var path = require( 'path' );
var fs = require( 'fs' );
var Promise = require( 'q' ).Promise;
var config = require( './config-model' ).server;
var client = require( 'redis' ).createClient( config.redis.cache.port, config.redis.cache.host, {
    auth_pass: config.redis.cache.password
} );
var utils = require( '../lib/utils' );
var debug = require( 'debug' )( 'manifest-model' );

// in test environment, switch to different db
if ( process.env.NODE_ENV === 'test' ) {
    client.select( 15 );
}

function getManifest( html, lang ) {
    var hash, version, doc, resources, themesSupported, date;
    var manifestKey = 'ma:' + lang + '_manifest';
    var versionKey = 'ma:' + lang + '_version';

    return new Promise( function( resolve, reject ) {
        // each language gets its own manifest
        client.get( manifestKey, function( error, manifest ) {
            if ( error ) {
                reject( error );
            } else if ( manifest && manifest !== 'null' ) {
                debug( 'getting manifest from cache' );
                resolve( manifest );
            } else {
                debug( 'building manifest from scratch' );
                doc = libxml.parseHtml( html );
                resources = [];
                themesSupported = config[ 'themes supported' ] || [];

                // href attributes of link elements
                resources = resources.concat( _getLinkHrefs( doc ) );

                // additional themes
                resources = resources.concat( _getAdditionalThemes( resources, themesSupported ) );

                // translations
                resources = resources.concat( _getTranslations( lang ) );

                // any resources inside css files
                resources = resources.concat( _getResourcesFromCss( resources ) );

                // src attributes
                resources = resources.concat( _getSrcAttributes( doc ) );

                // remove non-existing files, empties, duplicates and non-http urls
                resources = resources
                    .filter( _removeEmpties )
                    .filter( _removeDuplicates )
                    .filter( _removeNonHttpResources )
                    .filter( _removeNonExisting );

                // calculate the hash to serve as the manifest version number
                hash = _calculateHash( html, resources );

                // determine version
                _getVersionObj( versionKey )
                    .then( function( obj ) {
                        version = obj.version;
                        if ( obj.hash !== hash ) {
                            // create a new version
                            date = new Date().toISOString().replace( 'T', '|' );
                            version = date.substring( 0, date.length - 8 ) + '|' + lang;
                            // update stored version, don't wait for result
                            _updateVersionObj( versionKey, hash, version );
                        }
                        manifest = _getManifestString( version, resources );
                        // cache manifest for an hour, don't wait for result
                        client.set( manifestKey, manifest, 'EX', 1 * 60 * 60, function() {} );
                        resolve( manifest );
                    } );
            }
        } );
    } );

}

function _getManifestString( version, resources ) {
    return 'CACHE MANIFEST\n' +
        '# version: ' + version + '\n' +
        '\n' +
        'CACHE:\n' +
        resources.join( '\n' ) + '\n' +
        '\n' +
        'FALLBACK:\n' +
        '/_ /offline\n' +
        '\n' +
        'NETWORK:\n' +
        '*\n';
}

function _getVersionObj( versionKey ) {
    return new Promise( function( resolve, reject ) {
        client.hgetall( versionKey, function( error, obj ) {
            debug( 'result', obj );
            if ( error ) {
                reject( error );
            } else if ( obj && obj.hash && obj.version ) {
                resolve( obj );
            } else {
                resolve( {} );
            }
        } );
    } );
}

function _updateVersionObj( versionKey, hash, version ) {
    client.hmset( versionKey, {
        hash: hash,
        version: version
    }, function( error ) {} );
}

function _getLinkHrefs( doc ) {
    return doc.find( '//link[@href]' ).map( function( element ) {
        return element.attr( 'href' ).value();
    } );
}

function _getSrcAttributes( doc ) {
    return doc.find( '//*[@src]' ).map( function( element ) {
        return element.attr( 'src' ).value();
    } );
}

function _getAdditionalThemes( resources, themes ) {
    var urls = [];

    resources.forEach( function( resource ) {
        var themeStyleSheet = /theme-([A-z]+)(\.print)?\.css$/;
        if ( themeStyleSheet.test( resource ) ) {
            var foundTheme = resource.match( themeStyleSheet )[ 1 ];
            themes.forEach( function( theme ) {
                var themeUrl = resource.replace( foundTheme, theme );
                urls.push( themeUrl );
            } );
        }
    } );

    return urls;
}

function _getTranslations( lang ) {
    var langs = [];

    // fallback language
    langs.push( '/locales/en/translation.json' );

    if ( lang && lang !== 'en' ) {
        langs.push( '/locales/' + lang + '/translation.json' );
    }

    return langs;
}

function _getResourcesFromCss( resources ) {
    var content, matches,
        urlReg = /url\(['|"]?([^\)'"]+)['|"]?\)/g,
        cssReg = /^.+\.css$/,
        urls = [];

    resources.forEach( function( resource ) {
        if ( cssReg.test( resource ) ) {
            content = _getResourceContent( resource );
            while ( ( matches = urlReg.exec( content ) ) !== null ) {
                urls.push( matches[ 1 ] );
            }
        }
    } );

    return urls;
}

function _getResourceContent( resource ) {
    var rel;
    // in try catch in case css file is missing
    try {
        rel = ( resource.indexOf( '/locales/' ) === 0 ) ? '../../' : '../../public';
        return fs.readFileSync( path.join( __dirname, rel, url.parse( resource ).pathname ), 'utf8' );
    } catch ( e ) {
        return '';
    }
}

function _removeNonExisting( resource ) {
    var rel = ( resource.indexOf( '/locales/' ) === 0 ) ? '../../' : '../../public',
        resourcePath = path.join( __dirname, rel, url.parse( resource ).pathname ),
        // TODO: in later versions of node.js, this should be replaced by: fs.accessSync(resourcePath, fs.R_OK)
        exists = fs.existsSync( resourcePath );

    if ( !exists ) {
        debug( 'cannot find', resourcePath );
    }
    return exists;
}

function _removeEmpties( resource ) {
    return !!resource;
}

function _removeDuplicates( resource, position, array ) {
    return array.indexOf( resource ) == position;
}

function _removeNonHttpResources( resourceUrl ) {
    var parsedUrl = url.parse( resourceUrl );
    return parsedUrl.path && parsedUrl.protocol !== 'data:';
}

function _calculateHash( html, resources ) {
    var content,
        hash = utils.md5( html );

    resources.forEach( function( resource ) {
        try {
            content = _getResourceContent( resource );
            hash += utils.md5( content );
        } catch ( e ) {}
    } );

    // shorten hash
    return utils.md5( hash );
}

module.exports = {
    get: getManifest
};
