var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false,
  initialize: function() {
    // Hash and salt the password
    // Use bcrypt to set the hash on the model
    var password = this.get('password');
    bcrypt.hash(password, null, null, function(err, hash) {
      if (err) { throw err; }
      this.set('password', hash);
    }.bind(this));
  }
});

module.exports = User;