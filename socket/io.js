'use strict';

let _ = require('lodash');
let models = require('../models');
let http = require('http');
let io = require('socket.io')(http);
let uiio = io.of('/ui');
let runnerio = io.of('/runner');
const Op = require('sequelize').Op;

let register = {};
let listeners = {};

// Runner authentication and registry.
runnerio.use(function(socket, next) {
  let info;
  try {
    info = JSON.parse(socket.handshake.query.info);
  }
  catch (e) {
    return next(new Error('Cannot parse info for authentication.'));
  }

  if (!info.username) {
    return next(new Error('Username is not provided.'));
  }

  if (!info.key) {
    return next(new Error('Secret key is missing.'));
  }

  models.user.findOne({
    where: {username: info.username },
    include: [{model: models.key}]
  }).then((user) => {
    if (!user) {
      return next(new Error('DB error'));
    }

    if (!user) {
      return next(new Error('User with that username not found.'));
    }

    // Authorization
    let key = _.find(user.keys, { key: info.key });
    if (!key) {
      return next(new Error('Invalid secret API key.'));
    }

    let mac = info.interfaces && info.interfaces[0] && info.interfaces[0].mac;
    if (!mac) {
      return next('No interfaces');
    }

    models.machine.findOne({
      where: {
        username: info.username,
        interfaces: {
          [Op.contains]: [
            {'mac': mac}
          ]
        }
      },
      include: [{model: models.cog}]
    }).then((machine) => {
      function cb(err, machine) {
        if (err) {
          return next(err);
        }
        socket.machine = machine;
        socket.cogs = [];
        if (machine.cogs && machine.cogs.length > 0) {
          socket.cogs = machine.cogs;
        }
        uiio.emit('a machine', machine.dataValues);
        next();
      }

      if (!machine) {
        info.connected = true;
        info.last_connected = new Date();
        return models.machine.create(info).then((machine) => {
          cb(null, machine);
        });
      }
      else {
        if (register[machine.id]) {
          return next(new Error('The machine is already connected.'));
        }
        info.last_connected = new Date();
        let cogs = machine.cogs;
        machine.update(info, {where: {id: machine.id}}).then((machine) => {
          machine.cogs = cogs;
          cb(null, machine);
        });
      }
    });
  });
});

runnerio.on('connection', (socket) => {
  register[socket.machine.id] = socket;

  socket.on('disconnect', () => {
    if (!socket.machine) {
      return;
    }
    delete register[socket.machine.id];

    socket.machine.connected = false;
    socket.machine.last_disconnected = new Date();
    socket.machine.update(socket.machine).then((machine) => {
      uiio.emit('a machine', machine.dataValues);
    });
    delete socket.machine;
  });

  socket.on('u cog', (c) => {
    function cb(cog) {
      socket.emit('u cog success');
      uiio.emit('a cog', cog.dataValues);
    }

    let cog = _.find(socket.cogs, {id: c.id});
    if (!cog) {
      c.machine_id = socket.machine.id;
      models.cog.create(c).then((cog) => {
        socket.cogs.push(cog);
        cb(cog);
      });
    }
    else {
      // Update
      _.each([
        'type', 'tags', 'description', 'pid', 'host', 'port',
        'run', 'args', 'status', 'exitCode', 'cwd'
      ], (k) => {
        if (c[k]) {
          cog[k] = c[k];
        }
      });
      cog.update(cog).then((cog) => {
        cb(cog);
      });
    }
  });

  socket.on('u cogs', (cogs) => {
    models.cog.destroy({where:{machine_id: socket.machine.id}}).then(function() {
      for (let i = 0; i < cogs.length; i++) {
        cogs[i].machine_id = socket.machine.id;
      }
      models.cog.bulkCreate(cogs, function(createdCogs) {
        socket.cogs = createdCogs;
        socket.emit('u cogs success');
        uiio.emit('a cogs', createdCogs);
      });
    });
  });

  socket.on('r cog', (c) => {
    let cog = _.find(socket.cogs, {id: c.id});
    if (!cog) {
      return socket.emit('r cog error', 'Database error.');
    }
    else {
      cog.destroy().then(() => {
        c.machine_id = socket.machine.id;
        socket.emit('r cog success');
        console.log(c);
        uiio.emit('r cog', c);
      });
    }
  });

  socket.on('stream', (o) => {
    let cogId = o.cogId;
    let machineId = o.machineId = socket.machine.id;
    if (!cogId) {
      return;
    }
    let ls = (listeners[machineId] || {})[cogId];

    if (!ls) {
      return;
    }
    ls.forEach((l) => {
      l.emit('stream', o);
    });
  });

  socket.on('stat', (o) => {
    let cogId = o.cogId;
    let machineId = o.machineId = socket.machine.id;
    if (!cogId) {
      return;
    }
    let ls = (listeners[machineId] || {})[cogId];

    if (!ls) {
      return;
    }
    ls.forEach((l) => {
      l.emit('stat', o);
    });
  });
});

// GUI Authentication.
uiio.use(function(socket, next) {
  let username = socket.request.session.username;
  if (!username) {
    return next(new Error('User is not logged in.'));
  }

  models.user.findOne({where: { username: username, is_admin: true }}).then((user) => {
    if (!user) {
      return next(new Error('Authenticated user is not found.'));
    }

    socket.user = user;
    next();
  });
});

uiio.on('connection', (socket) => {
  let addedTo = {};

  socket.on('q machines', (filters) => {
    models.machine.findAll({where: filters || {}, include: [models.cog]}).then(machines => {
      socket.emit('a machines', _.map(machines, (m) => { return m.dataValues; }));
    });
  });

  socket.on('action', (action) => {
    var machineId = action.machineId;
    var cogId = action.cogId;

    var registeredSocket = register[machineId];
    if (!registeredSocket) {
      return socket.emit('action error', 'Not registered.');
    }

    var machine = listeners[machineId] = listeners[machineId] || {};
    var cog = machine[cogId] = machine[cogId] || new Set;

    // Stream forwarding.
    if (action.action == 'watch') {
      if (action.watching == true) {
        cog.add(socket);

        addedTo[machineId] = addedTo[machineId] || {}
        addedTo[machineId][cogId] = true;
      } 
      else {
        cog.delete(socket);

        addedTo[machineId] = addedTo[machineId] || {};
        delete addedTo[machineId][cogId];

        // Don't unwatch if there are others watching.
        if (cog.size > 0) {
          return;
        }
      }
    }

    if (action.action === 'playback') {
      // todo: potential race condition.
      registeredSocket.once('a playback', (streams) => {
        streams.forEach((stream) => {
          stream.machineId = machineId;
          stream.cogId = cogId;
          socket.emit('stream', stream);
        });
      });
    }

    registeredSocket.emit('action', action);
  });

  // User control.
  socket.on('q users', (filters) => {
    filters = filters || {};
    models.user.findAll({where: filters, include: [{model: models.key}]}).then((users) => {
      socket.emit('a users', _.map(users, (user) => { return user.dataValues; }));
    });
  });

  socket.on('u user', (u) => {
    let resolve = (user) => {
      models.key.destroy({where: {user_id: user.id}}).then(() => {
        let returnValue = user.dataValues;
        returnValue.keys = [];
        if (u.keys && u.keys.length > 0) {
          for (let i = 0; i < u.keys.length; i++) {
            returnValue.keys.push({key: u.keys[i].key});
            models.key.create({user_id: user.id, key: u.keys[i].key});
          }
        }

        socket.emit('u user success');
        uiio.emit('a user', user.returnValue);
      });
    };

    models.user.findOne({where: {username: u.username}}).then(user => {
      if (!user) {
        models.user.create(u).then((user) => { resolve(user); });
      }
      else {
        return user.update(u).then((user) => { resolve(user); });
      }
    });
  });

  socket.on('d user', (u) => {
    models.user.findOne({ username: u.username }).remove((err) => {
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

module.exports = io;
