var
  mongoose = require('mongoose'),
  settings = require('../settings'),
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
    isAdmin: true
  });

  console.log('Creating admin..')
  user.save({}, (err) => {
    if (err) return console.error('Error creating admin: ', err);
    else console.log('Admin user created.');
    mongoose.connection.close()
  });
});
