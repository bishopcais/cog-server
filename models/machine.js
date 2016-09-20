var
  _ = require('lodash'),
  mongoose = require('mongoose')
  User = require('./user');


var CogSchema = new mongoose.Schema({
  id: { type: String, index: true},
  type: String,
  tags: [String],
  description: String,

  pid: String,
  host: String,
  port: String,

  cwd: String,
  run: String,
  args: [String],

  status: String,
  exitCode: Number
});

var MachineSchema = new mongoose.Schema({
  connected: Boolean,
  lastConnected: Date,
  lastDisconnected: Date,

  platform: String,
  pid: Number,
  user: String,

  username: { type: String, index: true },

  interfaces: [{
    address: String,
    netmask: String,
    family: String,
    mac: String
  }],

  hostname: String,
  cpus: [{ model: String, speed: Number}],
  memory: Number,

  cogs: [CogSchema],
});

MachineSchema.statics.findOneByMac = function(info, next) {
  var aMac = info.interfaces && info.interfaces[0] && info.interfaces[0].mac;
  if (!aMac)
    return next(`Error. I can haz mac address.`);

  this.findOne({
    username: info.username,
    interfaces: { $elemMatch: { mac: aMac } }
  }).exec(next);
}

MachineSchema.statics.create = function(info, next) {
  var Machine = this;
  machine = new Machine(info);
  machine.connected = true;
  machine.lastConnected = new Date();
  machine.save(next);
}

MachineSchema.methods.updateInfo = function(info, next) {
  var machine = this;
  machine.platform = info.platform;
  machine.user = info.user;
  machine.pid = info.pid;
  machine.interfaces = info.interfaces;
  machine.hostname = info.hostname;
  machine.cpus = info.cpus;
  machine.memory = info.memory;
  machine.cogs = [];
  machine.connected = true;
  machine.lastConnected = new Date();
  machine.save(next);
}

MachineSchema.methods.updateCog = function(c, next) {
  var machine = this;

  var cog = _.find(machine.cogs, { id: c.id });
  if (!cog) { // Create
    machine.cogs.push(c);
    return machine.save(next);
  }

  // Update
  _.each([
    'type', 'tags',  'description', 'pid', 'host', 'port',
    'run', 'args', 'status', 'exitCode', 'cwd'
  ], (k) => {
    if (c[k]) cog[k] = c[k];
  });
  return machine.save(next);
}

MachineSchema.methods.removeCog = function(c, next) {
  var cog = _.find(this.cogs, { id: c.id });
  if (!cog) return next('Cog not found.');
  cog.remove();
  return this.save(next);
}

MachineSchema.methods.updateCogs = function(cs, next) {
  this.cogs = cs;
  return this.save(next);
}

module.exports = mongoose.model('Machine', MachineSchema);