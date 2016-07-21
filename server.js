var
  http = require('http'),
  mongoose = require('mongoose'),
  settings = require('./settings'),
  express = require('express'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  session = require('express-session');


// Connect to the database.
mongoose.connect(settings.db);
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error.');
  console.error(err);
});

// Session
var sessionMiddleware = session({
  key: 'express.sid',
  secret: 'secret',
  saveUninitialized: true,
  resave: false
});

// App
var app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(sessionMiddleware);
app.set('json spaces', 2);

app.use('/api/auth', require('./apis/auth'));
app.use('/api/machine', require('./apis/machine'));
app.use('/', express.static('public'));

// Server
var server = http.Server(app);
server.listen(settings.port);

// Start socket manager
var io = require('./socket/io');
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

io.listen(server);