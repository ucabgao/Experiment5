const chai = require('chai');
const APISDK = require('./../dist/index');
const expect = chai.expect;

chai.should();
chai.use(require('sinon-chai'));

var urls = {
  order: '/api/order/:id',
  user: {
    password: '/api/user/:id/password'
  }
};

var config = {
  urlPrefix: 'api/',
  cache: true,
  cachePrefix: 'api',
  overdueDay: 1
};

var api = new APISDK(urls, config);

describe('restful-API SDK', function() {
  describe('class itself', function() {
    it('should have static methods', function() {
      expect(APISDK).to.have.all.keys('all', 'httpCode', 'removeCache');
    });
  });

  describe('class instant', function() {
    it('should have member variable and methods', function() {
      expect(api).to.have.a.deep.property('order');
      expect(api).to.have.a.deep.property('user.password');
      [api.order, api.user.password].forEach(function(item) {
        expect(item).to.have.all.keys('get', 'put', 'post', 'del', 'patch', 'options', 'cache');
      });
    });
  });
});
