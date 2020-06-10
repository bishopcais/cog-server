#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const session = require('express-session');
const io = require('socket.io')(server);

const cogJson = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'cog.json'),
  {encoding: 'utf8'}
));

server.listen(cogJson.port, () => {
  console.log(`Server listening on 0.0.0.0:${cogJson.port}`);
});

// Session
let sessionMiddleware = session({
  key: 'express.sid',
  secret: 'secret',
  saveUninitialized: true,
  resave: false,
});

// App
app.use(express.json());
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

// Start socket manager
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

require('./socket/io')(io);
