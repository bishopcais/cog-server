let http = require('http');
let settings = require('./settings');
let express = require('express');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');

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
app.use('/api/user', require('./apis/user'));
app.use('/', express.static('public'));

// Server
let server = http.Server(app);
server.listen(settings.port, () => {
  console.log(`Server listening on ${settings.port}`);
});

// Start socket manager

let io = require('./socket/io');
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

io.listen(server);
