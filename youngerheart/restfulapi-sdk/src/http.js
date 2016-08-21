var Cache = require('browser-cache');
var Promise = require('./promise');
// 尝试解析json
var parse = function (str) {
    try {
        str = JSON.parse(str);
    }
    catch (e) {
    }
    return str;
};
// 根据参数对象生成参数
var getParamStr = function (params) {
    var paramStr = '';
    for (var key in params) {
        if (!paramStr)
            paramStr += key + '=' + encodeURI(params[key]);
        else
            paramStr += '\&' + key + '=' + encodeURI(params[key]);
    }
    return paramStr;
};
// 解析url和参数
var parseUrl = function (url, params) {
    params = JSON.parse(JSON.stringify(params));
    var proto = url.match(/:\w+/g);
    proto && proto.forEach(function (item) {
        var key = item.replace(':', '');
        if (params[key] != null) {
            url = url.replace(new RegExp(item, 'g'), JSON.stringify(params[key]));
            delete params[key];
        }
        else {
            url = url.replace(new RegExp(item + '/?', 'g'), '');
        }
    });
    var paramStr = getParamStr(params);
    return url + (paramStr ? '?' + paramStr : '');
};
// 生成四种方法
var http = (function () {
    function http(config) {
        if (typeof config === 'undefined' || config.cache) {
            this.config = config || {};
            this.config.urlPrefix = config.urlPrefix || '';
            Cache.init({
                limit: this.config.overdue || 3600,
                overdue: this.config.overdueDay || null,
                prefix: this.config.cachePrefix || 'api'
            });
            this.config.isSession = config.isSession || false;
            this.config.needCache = true;
        }
        else {
            this.config = {};
            this.config.urlPrefix = config.urlPrefix || '';
            this.config.needCache = false;
        }
    }
    ;
    http.prototype.getObj = function (url) {
        var _this = this;
        if (!url)
            return null;
        var obj = {
            get: this.getInitMethod('GET', url),
            post: this.getInitMethod('POST', url),
            put: this.getInitMethod('PUT', url),
            del: this.getInitMethod('DELETE', url),
            patch: this.getInitMethod('PATCH', url),
            options: this.getInitMethod('OPTIONS', url)
        };
        if (this.config.needCache) {
            obj.cache = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                return new Promise(_this.getCacheFunc.bind(_this), url, args);
            };
        }
        return obj;
    };
    ;
    http.prototype.getInitMethod = function (method, url) {
        var _this = this;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return new Promise(_this.getSendFunc.bind(_this), method, url, args);
        };
    };
    ;
    // 生成调用接口的函数
    http.prototype.getSendFunc = function (method, url, args, defer) {
        var _a = this.config, needCache = _a.needCache, isSession = _a.isSession, urlPrefix = _a.urlPrefix;
        // 直接调用接口
        var req = new XMLHttpRequest();
        var realUrl = '';
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (http.codeCallback)
                    http.codeCallback(req.status);
                if (req.status >= 200 && req.status < 300) {
                    var res = parse(req.responseText);
                    if (needCache && method === 'get') {
                        // 存入缓存操作
                        Cache.save(realUrl, res, isSession);
                    }
                    defer(true, res, req.status);
                }
                else {
                    defer(false, parse(req.responseText), req.status);
                }
            }
        };
        var openReq = function () {
            req.open(method, realUrl, true);
            if (method !== 'get')
                req.setRequestHeader('Content-type', 'application/json');
        };
        switch (args.length) {
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
    ;
    // 得到获取缓存数据的函数
    http.prototype.getCacheFunc = function (url, args, defer) {
        var _this = this;
        var _a = this.config, urlPrefix = _a.urlPrefix, isSession = _a.isSession;
        var realUrl = '';
        var deal = function () {
            Cache.deal(realUrl, function (overdue, data) {
                if (overdue || !data) {
                    // 请求接口数据
                    _this.getSendFunc('get', url, args, defer);
                }
                else {
                    setTimeout(function () {
                        if (http.codeCallback)
                            http.codeCallback(200);
                        defer(true, data, 200);
                    });
                }
            }, isSession);
        };
        switch (args.length) {
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
    ;
    http.httpCode = function (callback) {
        if (typeof callback === 'function')
            http.codeCallback = callback;
    };
    http.removeCache = function (key, isSession) {
        Cache.remove(key, isSession);
    };
    return http;
}());
;
module.exports = http;
