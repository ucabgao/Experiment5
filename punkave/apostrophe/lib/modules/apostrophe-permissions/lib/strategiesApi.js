var _ = require('lodash');

module.exports = function(self, options) {
  
  self.strategies = {
    doc: {
      generic: function(req, permissions, verb, type) {
        if (verb === 'view') {
          return true;
        }
        if (permissions[verb]) {
          return true;
        }
        if (permissions[verb + '-' + type]) {
          return true;
        }
        if (_.find(self.impliedBy[verb] || [], function(implied) {
          if (permissions[implied]) {
            return true;
          }
          if (permissions[implied + '-' + type]) {
            return true;
          }
        })) {
          return true;
        }
        return false;
      },
      specific: function(req, permissions, verb, type, object) {
        var clauses = [];
        // view permissions have some niceties
        if (verb === 'view') {
          // Case #1: it is published and no login is required
          if (object.published && (!object.loginRequired)) {
            return true;
          }

          // Case #2: for logged-in users with the guest permission,
          // it's OK to show objects with loginRequired set to `loginRequired` but not `certainPeople`
          // (this is called "Login Required" on the front end)
          if (permissions.guest) {
            if (object.published && (object.loginRequired === 'loginRequired')) {
              return true;
            }
          }

          // Case #3: object is restricted to certain people
          if (req.user && object.published && (object.loginRequired === 'certainPeople') && _.intersection(self.userPermissionNames(req.user, 'view'), object.docPermissions).length) {
            return true;
          }

          // Case #4: you can edit the object
          if (req.user && _.intersection(self.userPermissionNames(req.user, 'edit'), object.docPermissions).length) {
            return true;
          }
        } else {
          // Not view permissions

          // Case #4: we are only interested in people with a
          // specific permission.
          if (req.user && _.intersection(self.userPermissionNames(req.user, verb), object.docPermissions).length) {
            return true;
          }
        }
        return false;
      },
      criteria: function(req, permissions, verb) {

        var clauses = [];

        // view permissions have some niceties
        if (verb === 'view') {
          // Case #1: it is published and no login is required
          clauses.push({
            published: true,
            loginRequired: { $exists: false }
          });

          if (req.user) {
            // Case #2: for logged-in users with the guest permission,
            // it's OK to show docs with loginRequired set to `loginRequired` but not `certainPeople`
            // (this is called "Login Required" on the front end)
            if (permissions.guest) {
              clauses.push({
                published: true,
                loginRequired: 'loginRequired'
              });
            }

            // Case #3: doc is restricted to certain people

            clauses.push({
              published: true,
              loginRequired: 'certainPeople',
              docPermissions: { $in: self.userPermissionNames(req.user, 'view') }
            });

            // Case #4: can edit the doc
            clauses.push({
              docPermissions: {
                $in: self.userPermissionNames(req.user, 'edit')
              }
            });
          }
        } else {
          // Not view permissions

          if (!req.user) {
            // We want to never match
            return { _iNeverMatch: true };
          }
          // Case #4: we are only interested in people with a
          // specific permission.
          clauses.push({
            docPermissions: {
              $in: self.userPermissionNames(req.user, verb)
            }
          });
        }
        if (!clauses.length) {
          // Empty $or is an error in MongoDB 2.6
          return {};
        }
        return { $or: clauses };
      }
    }
  };

  _.extend(self.strategies, {
    owner: {
      generic: self.strategies.doc.generic,
      specific: function(req, permissions, verb, type, object) {
        if (verb === 'view') {
          return true;
        }
        // Assume everything else is an editing operation
        if (object.ownerId === self.getEffectiveUserId(req)) {
          return true;
        }
        return false;
      },
      criteria: function(req, permissions, verb) {
        if (verb === 'view') {
          return {};
        }
        return {
          ownerId: self.getEffectiveUserId(req)
        };
      }
    }
  });
};
