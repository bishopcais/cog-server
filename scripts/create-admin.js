var mongoose = require('mongoose');
mongoose.Promise = Promise;

var settings = require('../cog.json'),
    User = require('../models/user');


// Creates an admin user with username 'admin', and password 'password'
console.log('Connecting...')

console.log(settings);
mongoose.connect(settings.mongo.host || 'localhost', (err) => {
  if (err) {
    throw err;
  }
});

console.log('trying to make the user');

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
  else {
    console.log("Admin user created");
  }
  process.exit();
});
