const User = require('../models/user');

let user = new User({
  username: 'admin',
  password: 'password',
  name: 'Admin',
  email: 'admin@admin.com',
  isAdmin: true,
  keys: [
    {
      key: 'key'
    }
  ]
});

console.log(`Creating new user 'admin'`);
user.save(function(err) {
  if (err) {
    if (err['name'] === 'MongoError' && err['code'] == 11000) {
      console.warn('  admin already exists');
    }
    else {
      console.error('  Error creating admin: ', err);
    }
  }
  else {
    console.log('  done');
  }
  process.exit();
});
