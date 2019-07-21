#!/usr/bin/env node

const http = require('http');
const app = require('@cisl/express');
const express = require('express');
const session = require('express-session');
const path = require('path');
let io = require('./socket/io');

// Session
let sessionMiddleware = session({
  key: 'express.sid',
  secret: 'secret',
  saveUninitialized: true,
  resave: false
});

// App
app.use(sessionMiddleware);

app.use('/api/auth', require('./apis/auth'));
app.use('/api/machine', require('./apis/machine'));
app.use('/', express.static('public'));
app.use(
  '/css/fontawesome',
  express.static(path.join(__dirname, 'node_modules', '@fortawesome', 'fontawesome-free', 'css'))
);
app.use(
  '/css/webfonts',
  express.static(path.join(__dirname, 'node_modules', '@fortawesome', 'fontawesome-free', 'webfonts'))
);

// Server
let server = http.Server(app);

server.listen(app.get('port'), () => {
  console.log(`Running crun-server on port ${app.get('port')}`);
});

// Start socket manager
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

io.listen(server);
