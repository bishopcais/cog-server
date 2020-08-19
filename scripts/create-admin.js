'use strict';

const User = require('../src/server/models/user');

const user = new User({
  username: 'admin',
  password: 'password',
  name: 'Admin',
  email: 'admin@admin.com',
  isAdmin: true,
  keys: [
    {
      key: 'key',
    },
  ],
});

console.log("Creating/Verifying user 'admin':");
user.save((err) => {
  let exitCode = 0;
  if (err) {
    if (err['name'] === 'MongoError' && err['code'] === 11000) {
      console.log('>  verified');
    }
    else {
      console.error('  Error creating admin: ', err);
      exitCode = -1;
    }
  }
  else {
    console.log('>  created');
  }
  process.exit(exitCode);
});
