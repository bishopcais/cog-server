var settings = require('./settings');
var User = require('./models/user');
var mongoose = require('mongoose');
mongoose.connect(settings.db);

console.log("Creating new admin user");
var user = new User({ username: 'admin', password: 'password', isAdmin: true, name: 'Admin', email:'admin@admin.com' });
user.save();
console.log("Done");
process.exit();