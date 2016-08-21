const Cache = require('browser-cache');
const http = require('./http');

// 遍历url对象，生成api对象。
const walk = function(obj) {
  
};

// 深拷贝对象
const copy = function(obj) {
  var newObj = {};
  const walk = (obj, newObj) => {
    for(var key in obj) {
      if(typeof obj[key] === 'object') {
        newObj[key] = {};
        walk(obj[key], newObj[key]);
      } else if(typeof obj[key] === 'string') {
        newObj[key] = obj[key];
      }
    }
  };
  walk(obj, newObj);
  return newObj;
};

// 生成APISDK对象
class APISDK {
  constructor(url, config) {
    this.http = new http(config);
    var api = copy(url);
    this.walk(api);
    return api;
  }

  walk(obj) {
    for(var key in obj) {
      if(typeof obj[key] === 'object') {
        this.walk(obj[key]);
      } else if(typeof obj[key] === 'string') {
        var url = obj[key];
        obj[key] = ((url) => {
          return this.http.getObj(url);
        })(url);
      }
    }
  }
};

APISDK.all = require('./promise').all;
APISDK.httpCode = http.httpCode;
APISDK.removeCache = http.removeCache;
// 这里是一个坑
// var isWindow = (Function('return this')().constructor + '').match(/ (\w+)|$/)[1] === 'Window';
// if(isWindow) window.APISDK = APISDK;

module.exports = APISDK;
