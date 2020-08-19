'use strict';

const _ = require('lodash');
const fetch = require('node-fetch');
const User = require('./models/user');
const Machine = require('./models/machine');
const Service = require('./models/service');

let runnerio;
let uiio;

function checkServices() {
  const serviceWait = {};
  setInterval(async () => {
    const services = await Service.find();

    const promises = [];
    services.forEach((service) => {
      let needCheck = false;
      if (serviceWait[service._id]) {
        if (serviceWait[service._id] + 5000 > Date.now()) {
          return;
        }
        delete serviceWait[service._id];
      }
      if (!service.lastActive) {
        needCheck = true;
      }
      else if (service.lastActive.getTime() + (service.testInterval * 1000) < Date.now()) {
        needCheck = true;
      }

      if (needCheck) {
        let url = service.host;
        if (service.port) {
          url += `:${service.port}`;
        }
        url += service.testPath;
        promises.push(fetch(url).then((res) => res.json()).then(() => {
          // console.log(res);
          service.status = 'responsive';
          service.lastActive = new Date();
        }).catch(() => {
          service.status = 'UNRESPONSIVE';
        }).then(() => {
          return service.save();
        }));
        serviceWait[service._id] = Date.now();
      }
    });

    await Promise.all(promises).then(() => {
      uiio.emit('q? services');
    });
  }, 5000);
}

module.exports = (io) => {
  uiio = io.of('/ui');
  runnerio = io.of('/runner');

  const register = {};
  const listeners = {};

  // Runner authentication and registry.
  runnerio.use((socket, next) => {
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
      const key = _.find(user.keys, { key: info.key });
      if (!key) {
        next(new Error('Invalid secret API key.'));
        return;
      }

      Machine.findOneByMac(info, (err, machine) => {
        info.cogs = [];
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
          console.error(err);
          socket.emit('u cog error', 'Database error.');
          return;
        }
        else if (c.id == undefined) {
          console.error(`ERROR: id for ${JSON.stringify(c, null, 2)} is undefined.`);
          socket.emit('u cog error', 'cog id error.');
          return;
        }
        const cog = _.find(machine.cogs, { id: c.id }).toJSON();
        cog.machineId = machine._id;
        socket.emit('u cog success');
        uiio.emit('a cog', cog);
      });
    });

    socket.on('u cogs', (cs) => {
      socket.machine.updateCogs(cs, (err, machine) => {
        if (err) {
          console.error(err);
          socket.emit('u cogs error', 'Database error.');
          return;
        }
        const cogs = machine.toJSON().cogs;
        cogs.forEach((c) => c.machineId = machine._id);
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

    socket.on('clear', (o) => {
      const cid = o.cogId;
      const mid = o.machineId = socket.machine._id;
      if (!cid) {
        return;
      }

      const ls = (listeners[mid] || {})[cid];
      if (!ls) {
        return;
      }
      ls.forEach((l) => l.emit('clear', o));
    });

    socket.on('stream', (o) => {
      const cid = o.cogId;
      const mid = o.machineId = socket.machine._id;
      if (!cid) {
        return;
      }

      const ls = (listeners[mid] || {})[cid];
      if (!ls) {
        return;
      }
      ls.forEach((l) => l.emit('stream', o));
    });

    socket.on('stat', (o) => {
      const cid = o.cogId;
      const mid = o.machineId = socket.machine._id;
      if (!cid) {
        return;
      }

      const ls = (listeners[mid] || {})[cid];
      if (!ls) {
        return;
      }
      ls.forEach((l) => l.emit('stat', o));
    });
  });

  // GUI Authentication.
  uiio.use((socket, next) => {
    const username = socket.request.session.username;
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
    const addedTo = {};

    socket.on('q machines', (filters) => {
      Machine.find(filters || {}, (err, machines) => {
        if (err) {
          socket.emit('a machines error');
          return;
        }
        socket.emit('a machines', _.map(machines, (m) => m.toJSON()));
      });
    });

    socket.on('action', (action) => {
      const mid = action.machineId;
      const cid = action.cogId;

      const rs = register[mid];
      if (!rs) {
        console.error('action error');
        socket.emit('action error', 'Not registered.');
        return;
      }

      const m = listeners[mid] = listeners[mid] || {};
      const c = m[cid] = m[cid] || new Set();

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
      else if (action.action === 'playback') {
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
        socket.emit('a users', _.map(users, (u) => u.toJSON()));
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

    socket.on('q services', (filters) => {
      Service.find(filters || {})
        .sort({serviceType: 'ascending', host: 'ascending', port: 'ascending'})
        .exec((err, services) => {
          if (err) {
            socket.emit('u service error');
            return;
          }
          socket.emit('a services', _.map(services, (service) => service.toJSON()));
        });
    });

    // Stop stream forwarding.
    socket.on('disconnect', () => {
      for (const k in addedTo) {
        for (const l in addedTo[k]) {
          const m = (listeners[k] || {})[l];
          if (m) {
            m.delete(socket);
          }

          delete addedTo[k][l];

          if (m.size === 0 && register[k]) {
            register[k].emit('action', {
              'action': 'watch',
              'watching': false,
              'cogId': l,
            });
          }
        }
      }
    });
  });

  Machine.updateMany({}, { $set: { connected: false } }, { multi: true }, () => { });
  checkServices();
};
