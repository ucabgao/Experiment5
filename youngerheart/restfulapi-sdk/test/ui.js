const chai = require('chai');
const expect = chai.expect;

chai.should();
chai.use(require('sinon-chai'));

describe('instant usage', function() {
  // 使用服务
  before(function() {
    casper.on('page.initialized', function() {
      // 在webpack打包下会出现的问题
      // The problem is that PhantomJS v1.x does not support the Function.prototype.bind
      // 血的教训: http://stackoverflow.com/questions/25359247/casperjs-bind-issue
      this.evaluate(function(){
        var isFunction = function(o) {
          return typeof o == 'function';
        };

        var bind,
          slice = [].slice,
          proto = Function.prototype,
          featureMap;

        featureMap = {'function-bind': 'bind'};

        function has(feature) {
          var prop = featureMap[feature];
          return isFunction(proto[prop]);
        }

        // check for missing features
        if (!has('function-bind')) {
          // adapted from Mozilla Developer Network example at
          // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
          bind = function bind(obj) {
            var args = slice.call(arguments, 1),
              self = this,
              nop = function() {},
              bound = function() {
                return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
              };
            nop.prototype = this.prototype || {}; // Firefox cries sometimes if prototype is undefined
            bound.prototype = new nop();
            return bound;
          };
          proto.bind = bind;
        }
      });
    });
    casper.on('page.error', function(msg, trace) {
      this.echo('Error: ' + msg, 'ERROR');
    });
  });
  
  it('should receive current result', function() {
    casper.on("resource.received", function(resource) {
      if(resource.stage == 'end' && resource.url.indexOf('api/') !== -1) {
        this.echo(resource.url, 'PARAMETER');
        expect(['sdf', '0/change?id=wow&eee=123']).to.include(resource.url.split('api/')[1]);
      }
    });
    casper.start('http://youngerheart.github.io/restfulapi-sdk/');
  });
});
