const _ = require('lodash');
const celio = require('@cisl/celio');

const CogSchema = new celio.mongo.mongoose.Schema({
  id: { type: String, index: true},
  type: String,
  tags: [String],
  description: String,

  pid: Number,
  host: String,
  port: String,

  cwd: String,
  run: String,
  args: [String],

  status: String,
  exitCode: Number
});

const MachineSchema = new celio.mongo.mongoose.Schema({
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

  cogs: [CogSchema]
});

MachineSchema.statics.findOneByMac = function(info, next) {
  let aMac = info.interfaces && info.interfaces[0] && info.interfaces[0].mac;
  if (!aMac) {
    next(`Error. I can haz mac address.`);
    return;
  }

  this.findOne({
    username: info.username,
    interfaces: { $elemMatch: { mac: aMac } }
  }).exec(next);
};

MachineSchema.statics.create = function(info, next) {
  let Machine = this;
  let machine = new Machine(info);
  machine.connected = true;
  machine.lastConnected = new Date();
  machine.save(next);
};

MachineSchema.methods.updateInfo = function(info, next) {
  let machine = this;
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
};

MachineSchema.methods.updateCog = function(c, next) {
  let machine = this;

  let cog = _.find(machine.cogs, { id: c.id });
  if (!cog) { // Create
    machine.cogs.push(c);
    return machine.save(next);
  }

  // Update
  _.each([
    'type', 'tags', 'description', 'pid', 'host', 'port',
    'run', 'args', 'status', 'exitCode', 'cwd'
  ], (k) => {
    if (c[k]) cog[k] = c[k];
  });
  return machine.save(next);
};

MachineSchema.methods.removeCog = function(c, next) {
  let cog = _.find(this.cogs, { id: c.id });
  if (!cog) {
    return next('Cog not found.');
  }
  cog.remove();
  return this.save(next);
};

MachineSchema.methods.updateCogs = function(cs, next) {
  this.cogs = cs;
  return this.save(next);
};

module.exports = celio.mongo.mongoose.model('Machine', MachineSchema);
