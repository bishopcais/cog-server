#!/usr/bin/env node

const http = require('http');
const mongoose = require('mongoose');
const settings = require('./cog');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
let io = require('./socket/io');

// Connect to the database.
mongoose.Promise = global.Promise;
mongoose.connect(settings.mongo.host || 'localhost');
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error.');
  console.error(err);
});

// Session
let sessionMiddleware = session({
  key: 'express.sid',
  secret: 'secret',
  saveUninitialized: true,
  resave: false
});

// App
let app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(sessionMiddleware);
app.set('json spaces', 2);

app.use('/api/auth', require('./apis/auth'));
app.use('/api/machine', require('./apis/machine'));
app.use('/', express.static('public'));

// Server
let server = http.Server(app);
server.listen(settings.port, () => {
  console.log(`Running crun-server on port ${settings.port}`);
});

// Start socket manager
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

io.listen(server);
