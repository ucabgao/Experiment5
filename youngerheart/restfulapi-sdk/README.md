restfulapi-sdk
=========

[![NPM version](https://img.shields.io/npm/v/restfulapi-sdk.svg)](https://www.npmjs.com/package/restfulapi-sdk) [![Downloads](https://img.shields.io/npm/dm/restfulapi-sdk.svg)](http://badge.fury.io/js/restfulapi-sdk)

build [![Build Status](https://travis-ci.org/youngerheart/restfulapi-sdk.svg)](https://travis-ci.org/youngerheart/restfulapi-sdk) [![Coverage Status](https://img.shields.io/coveralls/youngerheart/restfulapi-sdk.svg)](https://coveralls.io/r/youngerheart/restfulapi-sdk/)

standard restful api sdk with cache and promise.


## What achieved 
1. standard restful api sdk for `get`, `post`, `put`, `delete`, `patch` and `options` methods.
2. save data in browser side, use `cache` method.
3. promise callback.

## usage

      $ npm install restfulapi-sdk
      $ bower install restfulapi-sdk // or use bower

Include `sdk.js` in `/dist` by tag , you can also require js by `require('restfulapi-sdk')`

      var urls = {
        order: '/api/order/:id',
        user: {
          password: '/api/user/:id/password'
        }
      };

      var config = {
        urlPrefix: 'api/', // you can add a urlPrefix, default ''
        cache: false, // open cache, default false (only valid with get method)
        cachePrefix: 'api', // cache prefix, default 'api'
        overdue: 3600, // cache time, unit second, default 3600
        overdueDay: null, // cache days number，prior to overdue，default null
        isSession: false // use sessionStorage for cache or not
      };

      const APISDK = require('restfulapi-sdk');
      const API = new APISDK(urls, config);

      var todo1 = API.order.get({
        id: id,
        otherRouteParams: ...
      });

      var todo2 = API.order.post({
        id: id,
        otherRouteParams: ...
      });

      // cache data with get method, will get remote data first
      API.order.cache({
        id: id,
        otherRouteParams: ...
      }).then((res, httpCode, refer) => {
        // success
        // do something
        refer(true, ...newRes); // arguments in next success()
        refer(false, ...newErr); // arguments in next error()
      }, (err, httpCode) => {
        // no data or overdue
      });

      APISDK.all([todo1, todo2])
      .then((successArr, errorArr, refer) => { // only trigger in success function
        // successArr[0] = [indexinPromiseArr, ...returnParams]
      });

      API.user.put({
        id: id
      }, {
        newPassword: newPassword
      }).then(() => {}, () => {}); // while use api data

      /*  static method for httpCode  */
      APISDK.httpCode((code) => {
        console.log(code);
      });

      /*  static method for remove Cache  */
      APISDK.remove(key, isSession); // cache key, and use sessionStorage for cache or not

## develop

      $ clone restfulapi-sdk && make dev // then view http://localhost:8888


