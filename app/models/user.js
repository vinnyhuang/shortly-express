var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false,
  initialize: function() {
    //do nothing for now
  }
});

module.exports = User;