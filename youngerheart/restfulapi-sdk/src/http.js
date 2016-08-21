/* @flow */
const Cache = require('browser-cache');
const Promise = require('./promise');

// 尝试解析json
const parse = (str) => {
  try {
    str = JSON.parse(str);
  } catch(e) {
    // this is a normal String
  }
  return str;
};

// 根据参数对象生成参数
const getParamStr = (params) => {
  var paramStr = '';
  for(let key in params) {
    if(!paramStr) paramStr += key + '=' + encodeURI(params[key]);
    else paramStr += '\&' + key + '=' + encodeURI(params[key]);
  }
  return paramStr;
};

// 解析url和参数
const parseUrl = (url, params) => {
  params = JSON.parse(JSON.stringify(params));
  var proto = url.match(/:\w+/g);
  proto && proto.forEach((item) => {
    let key = item.replace(':', '');
    if(params[key] != null) {
      url = url.replace(new RegExp(item ,'g'), JSON.stringify(params[key]));
      delete params[key];
    } else {
      url = url.replace(new RegExp(item + '/?', 'g'), '');
    }
  });
  var paramStr = getParamStr(params);
  return url + (paramStr ? '?' + paramStr : '');
};

// 生成四种方法
class http {
  constructor(config) {
    if(typeof config === 'undefined' || config.cache) {
      this.config = config || {};
      this.config.urlPrefix = config.urlPrefix || '';
      Cache.init({
        limit: this.config.overdue || 3600,
        overdue: this.config.overdueDay || null,
        prefix: this.config.cachePrefix || 'api'
      });
      this.config.isSession = config.isSession || false;
      this.config.needCache = true;
    } else {
      this.config = {};
      this.config.urlPrefix = config.urlPrefix || '';
      this.config.needCache = false;
    }
  };

  getObj(url) {
    if(!url) return null;
    var obj = {
      get: this.getInitMethod('GET', url),
      post: this.getInitMethod('POST', url),
      put: this.getInitMethod('PUT', url),
      del: this.getInitMethod('DELETE', url),
      patch: this.getInitMethod('PATCH', url),
      options: this.getInitMethod('OPTIONS', url),
    };
    if(this.config.needCache) {
      obj.cache = (...args) => {
        return new Promise(this.getCacheFunc.bind(this), url, args);
      };
    }
    return obj;
  };

  getInitMethod(method, url) {
    return (...args) => {
      return new Promise(this.getSendFunc.bind(this), method, url, args);
    };
  };

  // 生成调用接口的函数
  getSendFunc(method, url, args, defer) {
    var {needCache, isSession, urlPrefix} = this.config;
    // 直接调用接口
    const req = new XMLHttpRequest();
    var realUrl = '';
    req.onreadystatechange = () => {
      if(req.readyState === 4) {
        if(http.codeCallback) http.codeCallback(req.status);
        if(req.status >= 200 && req.status < 300) {
          var res = parse(req.responseText);
          if(needCache && method === 'get') {
            // 存入缓存操作
            Cache.save(realUrl, res, isSession);
          }
          defer(true, res, req.status);
        } else {
          defer(false, parse(req.responseText), req.status);
        }
      }
    };

    var openReq = () => {
      req.open(method, realUrl, true);
      if(method !== 'get') req.setRequestHeader('Content-type', 'application/json');
    };

    switch(args.length) {
      case 0:
        realUrl = urlPrefix + parseUrl(url, {});
        openReq();
        req.send();
        break;
      case 1:
        realUrl = urlPrefix + parseUrl(url, args[0]);
        openReq();
        req.send();
        break;
      case 2:
        realUrl = urlPrefix + parseUrl(url, args[0]);
        openReq();
        req.send(JSON.stringify(args[1]));
        break;
    }
  };

  // 得到获取缓存数据的函数
  getCacheFunc(url, args, defer) {
    var {urlPrefix, isSession} = this.config;
    var realUrl = '';
    var deal = () => {
      Cache.deal(realUrl, (overdue, data) => {
        if(overdue || !data) {
          // 请求接口数据
          this.getSendFunc('get', url, args, defer);
        } else {
          setTimeout(() => {
            if(http.codeCallback) http.codeCallback(200);
            defer(true, data, 200);
          });
        } 
      }, isSession);
    };
    switch(args.length) {
      case 0:
        realUrl = urlPrefix + parseUrl(url, {});
        deal();
        break;
      case 1:
      case 2:
        realUrl = urlPrefix + parseUrl(url, args[0]);
        deal();
        break;
    }
  };

  static httpCode(callback) {
    if(typeof callback === 'function') http.codeCallback = callback;
  }

  static removeCache(key, isSession) {
    Cache.remove(key, isSession);
  }
};

module.exports = http;
