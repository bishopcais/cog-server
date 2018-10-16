"use strict"

var
  querystring = require('querystring'),
  _ = require('lodash'),

  User = require('../models/user'),
  Machine = require('../models/machine'),
  http = require('http'),
  io = require('socket.io')(http),
  uiio = io.of('/ui'),
  runnerio = io.of('/runner'),

  register = {},
  listeners = {};


// Runner authentication and registry.
runnerio.use(function(socket, next) {
  try {
    var info = JSON.parse(socket.handshake.query.info);
  } catch(e) {
    return next(new Error('Cannot parse info for authentication.'))
  }

  if (!info.username)
    return next(new Error('Username is not provided.'));

  if (!info.key)
    return next(new Error('Secret key is missing.'));

  User.findOne({ username: info.username }).exec((err, user) => {
    if (err)
      return next(new Error('DB error -'+ err));

    if (!user)
      return next(new Error('User with that username not found.'));

    // Authorization
    var key = _.find(user.keys, { key: info.key });
    if (!key)
      return next(new Error('Invalid secret API key.'));

    Machine.findOneByMac(info, (err, machine) => {
      if (err)
        return next(err);

      function cb(err, machine) {
        if (err)
          return next(err);
        socket.machine = machine;
        uiio.emit('a machine', machine.toJSON());
        next();
      }

      if (!machine)
        return Machine.create(info, cb)

      if (register[machine._id])
        return next(new Error('The machine is already connected.'));

      machine.updateInfo(info, cb);
    });
  });
});

runnerio.on('connection', (socket) => {
  register[socket.machine._id] = socket;

  socket.on('disconnect', () => {
    if (!socket.machine) return;
    delete register[socket.machine._id];

    socket.machine.connected = false;
    socket.machine.lastDisconnected = new Date();
    socket.machine.save((err, machine) => {
      if (!err) 
        uiio.emit('a machine', machine.toJSON());
    });
    delete socket.machine;
  });

  socket.on('u cog', (c) => {
    socket.machine.updateCog(c, (err, machine) => {
      if (err) {
        console.log(err);
        return socket.emit('u cog error', 'Database error.');
      }
      else if (c.id == undefined) {
        console.error(`ERROR: id for ${JSON.stringify(c. null, 2)} is undefined.`);
        return socket.emit('u cog error', 'cog id error.');
      }
      var cog = _.find(machine.cogs, { id: c.id }).toJSON();
      cog.machineId = machine._id;
      socket.emit('u cog success');
      uiio.emit('a cog', cog);
    });
  });

  socket.on('u cogs', (cs) => {
    socket.machine.updateCogs(cs, (err, machine) => {
      if (err) {
        console.log(err);
        return socket.emit('u cogs error', 'Database error.');
      }
      var cogs = machine.toJSON().cogs;
      cogs.forEach((c) => { c.machineId = machine._id });
      socket.emit('u cogs success');
      uiio.emit('a cogs', machine.cogs);
    });
  });

  socket.on('r cog', (c) => {
    socket.machine.removeCog(c, (err, machine) => {
      if (err) {
        console.log(err);
        return socket.emit('r cog error', 'Database error.');
      }
      socket.emit('r cog success');
      c.machineId = machine._id;
      uiio.emit('r cog', c);
    });
  });

  socket.on('stream', (o) => {
    var cid = o.cogId;
    var mid = o.machineId = socket.machine._id;
    if (!cid) return;
    var ls = (listeners[mid] || {})[cid];

    if (!ls) return;
    ls.forEach((l)=>{ l.emit('stream', o); });
  });

  socket.on('stat', (o) => {
    var cid = o.cogId;
    var mid = o.machineId = socket.machine._id;
    if (!cid) return;
    var ls = (listeners[mid] || {})[cid];

    if (!ls) return;
    ls.forEach((l)=>{ l.emit('stat', o); });
  });
});

// GUI Authentication.
uiio.use(function(socket, next) {
  var username = socket.request.session.username;
  if (!username)
    return next(new Error('User is not logged in.'));

  User.findOne({ username: username, isAdmin: true }).exec((err, user) => {
    if (err)
      return next(new Error('Authenticated user is not found.'));

    socket.user = user;
    next();
  });
});


uiio.on('connection', (socket) => {
  var addedTo = {};

  socket.on('q machines', (filters) => {
    Machine.find(filters || {}, (err, machines) => {
      socket.emit('a machines', _.map(machines, (m) => { return m.toJSON(); }));
    });
  });

  socket.on('action', (action) => {
    var mid = action.machineId;
    var cid = action.cogId;

    var rs = register[mid];
    if (!rs) return socket.emit('action error', 'Not registered.');

    var m = listeners[mid] = listeners[mid] || {};
    var c = m[cid] = m[cid] || new Set;

    // Stream forwarding.
    if (action.action == 'watch') {
      if (action.watching == true) {
        c.add(socket);

        addedTo[mid] = addedTo[mid] || {}
        addedTo[mid][cid] = true;
      } else {
        c.delete(socket);

        addedTo[mid] = addedTo[mid] || {};
        delete addedTo[mid][cid];

        // Don't unwatch if there are others watching.
        if (c.size > 0) return;
      }
    }

    if (action.action == 'playback') {
      // todo: potential race condition.
      rs.once('a playback', (streams) => {
        streams.forEach((s) => {
          s.machineId = mid;
          s.cogId = cid;
          socket.emit('stream', s)
        });
      });
    }

    rs.emit('action', action);
  });

  // User control.
  socket.on('q users', (filters) => {
    User.find(filters || {}, (err, users) => {
      socket.emit('a users', _.map(users, (u) => { return u.toJSON(); }));
    });
  });

  socket.on('u user', (u) => {
    User.createOrUpdate(u, (err, user) => {
      if (err) return socket.emit('u user error');
      
      socket.emit('u user success');
      uiio.emit('a user', user.toJSON());
    })
  });

  socket.on('d user', (u) => {
    User.findOne({ username: u.username }).remove((err) => {
      if (err) return socket.emit('d user error');

      socket.emit('d user success', u);
      uiio.emit('d user', u);
    });
  });

  // Stop stream forwarding.
  socket.on('disconnect', () => {
    var k, l, m;
    for (k in addedTo) {
      for (l in addedTo[k]) {
        var m = (listeners[k] || {})[l];
        if (m) m.delete(socket);

        delete addedTo[k][l];

        if (m.size == 0 && register[k])
          register[k].emit('action', {
            'action': 'watch',
            'watching': false,
            'cogId': l
          });
      }
    }
  });
});

Machine.update({}, { $set: { connected: false } }, { multi: true }, ()=>{ });
module.exports = io;
