'use strict';

const _ = require('lodash');
const io = require('@cisl/io');

const CogSchema = new io.mongo.mongoose.Schema({
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
  exitCode: Number,
});

const MachineSchema = new io.mongo.mongoose.Schema({
  connected: Boolean,
  lastConnected: Date,
  lastDisconnected: Date,

  platform: String,
  pid: Number,
  user: String,

  username: { type: String, index: true },

  interfaces: [
    {
      address: String,
      netmask: String,
      family: String,
      mac: String,
    },
  ],

  hostname: String,
  cpus: [{ model: String, speed: Number}],
  memory: Number,

  cogs: [CogSchema],
});

MachineSchema.statics.findOneByMac = function(info, next) {
  const aMac = info.interfaces && info.interfaces[0] && info.interfaces[0].mac;
  if (!aMac) {
    next(new Error('Mac address not found.'));
    return;
  }

  this.findOne({
    username: info.username,
    interfaces: { $elemMatch: { mac: aMac } },
  }).exec(next);
};

MachineSchema.statics.create = function(info, next) {
  const Machine = this;
  const machine = new Machine(info);
  machine.connected = true;
  machine.lastConnected = new Date();
  machine.save(next);
};

MachineSchema.methods.updateInfo = function(info, next) {
  this.platform = info.platform;
  this.user = info.user;
  this.pid = info.pid;
  this.interfaces = info.interfaces;
  this.hostname = info.hostname;
  this.cpus = info.cpus;
  this.memory = info.memory;
  this.cogs = [];
  this.connected = true;
  this.lastConnected = new Date();
  this.save(next);
};

MachineSchema.methods.updateCog = function(c, next) {
  const cog = _.find(this.cogs, { id: c.id });
  if (!cog) {
    this.cogs.push(c);
    return this.save(next);
  }

  // Update
  _.each([
    'type',
    'tags',
    'description',
    'pid',
    'host',
    'port',
    'run',
    'args',
    'status',
    'exitCode',
    'cwd',
  ], (k) => {
    if (c[k]) {
      cog[k] = c[k];
    }
  });
  return this.save(next);
};

MachineSchema.methods.removeCog = function(c, next) {
  const cog = _.find(this.cogs, { id: c.id });
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

module.exports = io.mongo.mongoose.model('Machine', MachineSchema);
