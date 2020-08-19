'use strict';

const io = require('@cisl/io');

const ServiceSchema = new io.mongo.mongoose.Schema({
  host: {type: String, index: true},
  port: {type: Number, index: true},
  instanceName: String,
  serviceType: String,
  launchPath: String,
  launchInvocation: String,
  pid: Number,
  testRoute: String,
  testInterval: Number,
  status: String,
  lastActive: Date,
  lastRegistered: Date,
  lastModified: Date,
  dockerized: Boolean,
});

module.exports = io.mongo.mongoose.model('Service', ServiceSchema);
