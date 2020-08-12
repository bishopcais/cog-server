#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const express = require('express');
const app = express();
const server = require('http').Server(app);
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const io = require('socket.io')(server);

const webpackConfig = require('./webpack.config');

const cogJson = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'cog.json'),
  {encoding: 'utf8'}
));

const isProduction = process.env.NODE_ENV === 'production';

server.listen(cogJson.port, () => {
  console.log(`Server listening on 0.0.0.0:${cogJson.port}`);
});

let store = undefined;

if (isProduction) {
  store = new MongoDBStore({
    uri: `mongodb://${cogJson.mongo.host}/cais`,
    collection: 'sessions',
  });
}

// Session
let sessionMiddleware = session({
  key: 'express.sid',
  secret: crypto.randomBytes(20).toString('hex'),
  saveUninitialized: true,
  resave: false,
  store: store,
});

if (!isProduction) {
    //reload=true:Enable auto reloading when changing JS files or content
    //timeout=1000:Time from disconnecting from server to reconnecting
    webpackConfig.entry.app.unshift('webpack-hot-middleware/client?reload=true&timeout=1000');

    //Add HMR plugin
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

    const compiler = webpack(webpackConfig);

    //Enable "webpack-dev-middleware"
    app.use(webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
    }));

    //Enable "webpack-hot-middleware"
    app.use(webpackHotMiddleware(compiler));
}

// App
app.use(express.json());
app.use(sessionMiddleware);

app.use('/api/auth', require('./apis/auth'));
app.use('/api/machine', require('./apis/machine'));
app.use('/', express.static('public'));
if (isProduction) {
  app.use('/js/bundle.js', express.static(path.join(__dirname, 'dist', 'bundle.js')));
}

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
