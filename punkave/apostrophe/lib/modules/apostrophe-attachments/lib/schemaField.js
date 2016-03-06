var _ = require('lodash');
var async = require('async');

module.exports = function(self, options) {

  self.rawPartial = self.partial;

  self.addFieldType = function() {
    self.apos.schemas.addFieldType({
      name: self.name,
      partial: self.fieldTypePartial,
      converters: self.converters
    });
  };

  self.fieldTypePartial = function(data) {
    return self.partial('attachment', data);
  };

  self.converters = {
    csv: function(req, data, name, object, field, callback) {
      // TODO would be interesting to support filenames mapped to a
      // configurable folder, with sanitization
      return setImmediate(callback);
    },
    form: function(req, data, name, object, field, callback) {
      var info = data[name];
      if (typeof(info) !== 'object') {
        info = {};
      }
      info = _.pick(info, '_id', 'crop');
      info._id = self.apos.launder.id(info._id);
      if (!info._id) {
        object[name] = null;
        return setImmediate(callback);
      }
      info.crop = info.crop ? self.sanitizeCrop(info.crop) : undefined;
      return async.series({
        find: function(callback) {
          return self.db.findOne({ _id: info._id }, function(err, trueInfo) {
            if (err) {
              return callback(err);
            }
            if (!trueInfo) {
              object[name] = null;
              return setImmediate(callback);
            }
            _.assign(info, trueInfo);
            var fileGroup = self.getFileGroup(info.extension);
            if (!fileGroup || (field.groups && !_.contains(field.groups, fileGroup))) {
              object[name] = null;
              return setImmediate(callback);
            }
            if (info.crop) {
              if (!_.find(info.crops, info.crop)) {
                info.crop = null;
              }
            }
            return callback(null);
          });
        },
        update: function(callback) {
          info.used = true;
          return self.db.update({ _id: info._id }, info, callback);
        }
      }, function(err) {
        if (err) {
          return callback(err);
        }
        object[name] = info;
        return callback(null);
      });
    }
  };

  self.indexer = function(value, field, texts) {
    var silent = (field.silent === undefined) ? true : field.silent;
    texts.push({ weight: field.weight || 15, text: value.title, silent: silent });
  };

}
