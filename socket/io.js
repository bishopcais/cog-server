'use script';

const _ = require('lodash');

const User = require('../models/user');
const Machine = require('../models/machine');
const http = require('http');
const io = require('socket.io')(http);
const uiio = io.of('/ui');
const runnerio = io.of('/runner');

let register = {};
let listeners = {};

// Runner authentication and registry.
runnerio.use(function(socket, next) {
  let info;
  try {
    info = JSON.parse(socket.handshake.query.info);
  }
  catch (e) {
    next(new Error('Cannot parse info for authentication.'));
    return;
  }

  if (!info.username) {
    next(new Error('Username is not provided.'));
    return;
  }

  if (!info.key) {
    next(new Error('Secret key is missing.'));
    return;
  }

  User.findOne({ username: info.username }).exec((err, user) => {
    if (err) {
      next(new Error(`DB error - ${err}`));
      return;
    }

    if (!user) {
      next(new Error('User with that username not found.'));
      return;
    }

    // Authorization
    let key = _.find(user.keys, { key: info.key });
    if (!key) {
      next(new Error('Invalid secret API key.'));
      return;
    }

    Machine.findOneByMac(info, (err, machine) => {
      if (err) {
        next(err);
        return;
      }

      function cb(err, machine) {
        if (err) {
          next(err);
          return;
        }
        socket.machine = machine;
        uiio.emit('a machine', machine.toJSON());
        next();
        return;
      }

      if (!machine) {
        Machine.create(info, cb);
        return;
      }

      if (register[machine._id]) {
        next(new Error('The machine is already connected.'));
        return;
      }

      machine.updateInfo(info, cb);
    });
  });
});

runnerio.on('connection', (socket) => {
  register[socket.machine._id] = socket;

  socket.on('disconnect', () => {
    if (!socket.machine) {
      return;
    }
    delete register[socket.machine._id];

    socket.machine.connected = false;
    socket.machine.lastDisconnected = new Date();
    socket.machine.save((err, machine) => {
      if (!err) {
        uiio.emit('a machine', machine.toJSON());
      }
    });
    delete socket.machine;
  });

  socket.on('u cog', (c) => {
    socket.machine.updateCog(c, (err, machine) => {
      if (err) {
        console.log(err);
        socket.emit('u cog error', 'Database error.');
        return;
      }
      else if (c.id == undefined) {
        console.error(`ERROR: id for ${JSON.stringify(c, null, 2)} is undefined.`);
        socket.emit('u cog error', 'cog id error.');
        return;
      }
      let cog = _.find(machine.cogs, { id: c.id }).toJSON();
      cog.machineId = machine._id;
      socket.emit('u cog success');
      uiio.emit('a cog', cog);
    });
  });

  socket.on('u cogs', (cs) => {
    socket.machine.updateCogs(cs, (err, machine) => {
      if (err) {
        console.log(err);
        socket.emit('u cogs error', 'Database error.');
        return;
      }
      let cogs = machine.toJSON().cogs;
      cogs.forEach((c) => { c.machineId = machine._id; });
      socket.emit('u cogs success');
      uiio.emit('a cogs', machine.cogs);
    });
  });

  socket.on('r cog', (c) => {
    socket.machine.removeCog(c, (err, machine) => {
      if (err) {
        socket.emit('r cog error', 'Database error.');
        return;
      }
      socket.emit('r cog success');
      c.machineId = machine._id;
      uiio.emit('r cog', c);
    });
  });

  socket.on('stream', (o) => {
    let cid = o.cogId;
    let mid = o.machineId = socket.machine._id;
    if (!cid) {
      return;
    }
    let ls = (listeners[mid] || {})[cid];

    if (!ls) {
      return;
    }
    ls.forEach((l) => { l.emit('stream', o); });
  });

  socket.on('stat', (o) => {
    let cid = o.cogId;
    let mid = o.machineId = socket.machine._id;
    if (!cid) {
      return;
    }
    let ls = (listeners[mid] || {})[cid];

    if (!ls) {
      return;
    }
    ls.forEach((l) => { l.emit('stat', o); });
  });
});

// GUI Authentication.
uiio.use(function(socket, next) {
  let username = socket.request.session.username;
  if (!username) {
    next(new Error('User is not logged in.'));
    return;
  }

  User.findOne({ username: username, isAdmin: true }).exec((err, user) => {
    if (err) {
      next(new Error('Authenticated user is not found.'));
      return;
    }

    socket.user = user;
    next();
  });
});

uiio.on('connection', (socket) => {
  let addedTo = {};

  socket.on('q machines', (filters) => {
    Machine.find(filters || {}, (err, machines) => {
      if (err) {
        socket.emit('a machines error');
        return;
      }
      socket.emit('a machines', _.map(machines, (m) => { return m.toJSON(); }));
    });
  });

  socket.on('action', (action) => {
    let mid = action.machineId;
    let cid = action.cogId;

    let rs = register[mid];
    if (!rs) {
      socket.emit('action error', 'Not registered.');
      return;
    }

    let m = listeners[mid] = listeners[mid] || {};
    let c = m[cid] = m[cid] || new Set();

    // Stream forwarding.
    if (action.action === 'watch') {
      if (action.watching) {
        c.add(socket);

        addedTo[mid] = addedTo[mid] || {};
        addedTo[mid][cid] = true;
      }
      else {
        c.delete(socket);

        addedTo[mid] = addedTo[mid] || {};
        delete addedTo[mid][cid];

        // Don't unwatch if there are others watching.
        if (c.size > 0) {
          return;
        }
      }
    }

    if (action.action == 'playback') {
      // todo: potential race condition.
      rs.once('a playback', (streams) => {
        streams.forEach((s) => {
          s.machineId = mid;
          s.cogId = cid;
          socket.emit('stream', s);
        });
      });
    }

    rs.emit('action', action);
  });

  // User control.
  socket.on('q users', (filters) => {
    User.find(filters || {}, (err, users) => {
      if (err) {
        socket.emit('u user error');
        return;
      }
      socket.emit('a users', _.map(users, (u) => { return u.toJSON(); }));
    });
  });

  socket.on('u user', (u) => {
    User.createOrUpdate(u, (err, user) => {
      if (err) {
        socket.emit('u user error');
        return;
      }

      socket.emit('u user success');
      uiio.emit('a user', user.toJSON());
    });
  });

  socket.on('d user', (u) => {
    User.findOne({ username: u.username }).remove((err) => {
      if (err) {
        socket.emit('d user error');
        return;
      }

      socket.emit('d user success', u);
      uiio.emit('d user', u);
    });
  });

  // Stop stream forwarding.
  socket.on('disconnect', () => {
    for (let k in addedTo) {
      for (let l in addedTo[k]) {
        let m = (listeners[k] || {})[l];
        if (m) {
          m.delete(socket);
        }

        delete addedTo[k][l];

        if (m.size === 0 && register[k]) {
          register[k].emit('action', {
            'action': 'watch',
            'watching': false,
            'cogId': l
          });
        }
      }
    }
  });
});

Machine.updateMany({}, { $set: { connected: false } }, { multi: true }, () => { });
module.exports = io;
