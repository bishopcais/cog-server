var mongoose = require('mongoose');
mongoose.Promise = Promise;

var settings = require('../settings'),
    User = require('../models/user');


// Creates an admin user with username 'admin', and password 'password'
console.log('Connecting...')

mongoose.connect(settings.db)

var user = new User({
  username: 'admin',
  password: 'password',
  name: 'Admin',
  email: 'admin@admin.com',
  isAdmin: true,
  keys: [
    {
      key: "key"
    }
  ]
});
user.save(function(err) {
  if (err) {
    if (err['name'] == 'MongoError' && err['code'] == 11000) {
      console.log('admin already exists');
    }
    else {
      console.log('Error creating admin: ', err);
    }
  }
  process.exit();
});
