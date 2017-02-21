var mongoose = require('mongoose');
mongoose.Promise = Promise;

var settings = require('../settings'),
  User = require('../models/user');


// Creates an admin user with username 'admin', and password 'password'
console.log('Connecting...')

mongoose.connect(settings.db)

mongoose.connection.on('error',
  console.error.bind(console, 'connection error:')
);

mongoose.connection.once('open', () => {
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

  console.log('Creating admin...')
  user.save({}, (err) => {
    if (err) {
      // Don't consider it an error that the admin already exists
      if (err['name'] == 'MongoError' && err['code'] == 11000) {
        console.log('admin already exists.');
      }
      else {
        console.error('Error creating admin: ', err);
      }
    }
    else {
      console.log('admin created.');
    }
    mongoose.connection.close();
    process.exit();
  });
});
