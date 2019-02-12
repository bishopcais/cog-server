#!/usr/bin/env node

const http = require('http');
const app = require('@cisl/cir-express');
const session = require('express-session');
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
app.use('/', app.express.static('public'));

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
