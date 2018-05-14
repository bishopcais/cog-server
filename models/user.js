var _ = require('lodash');
var mongoose = require('mongoose');
mongoose.Promise = Promise;
var settings = require('../settings');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, lowercase: true },
  password: { type: String },
  keys: [{
    key: { type: String }
  }],

  isAdmin: { type: Boolean, default: false },
  name: { type: String, default: '' },
  email: { type: String }
});

UserSchema.methods.getJSON = function() {
  return {
    'id': this._id,
    'email': this.email,
    'name': this.name
  };
};

UserSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    var pw = bcrypt.hashSync(this.get('password'), bcrypt.genSaltSync())
    this.set('password', pw);
  }
  next();
});


UserSchema.statics.createOrUpdate = function(u, next) {
  var User = this;

  User.findOne({ username: u.username }).exec((err, user) => {
    if (err) return next(err);
    if (!user){
      user = new User(u);
    } else {
      _.each(['username', 'name', 'password', 'email', 'isAdmin', 'keys'], (k) => {
        if (u[k]) user[k] = u[k];
      });
    }
    user.save(next);
  });

}

UserSchema.statics.authenticate = function(creds, cb) {
  var User = this;

  User.findOne({ username: creds.username }).exec( (err, user) => {
    if (err) return cb('Database error.');
    if (!user) return cb('User not found');

    var match = bcrypt.compareSync(creds.password, user.password);
    if (!match) return cb('Passwords don\'t match');
    return cb(null, user);
  });
};

module.exports = mongoose.model('User', UserSchema);
