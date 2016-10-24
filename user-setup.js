var settings = require('./settings');
var User = require('./models/user');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(settings.db);

console.log("Creating new admin user");
var user = new User({ username: 'admin', password: 'password', isAdmin: true, name: 'Admin', email:'admin@admin.com' });
user.save(function(err) {
  if (err) {
    console.error("ERROR: " + err.message);
    process.exit();
  }
  console.log("Done");
  process.exit();
});
