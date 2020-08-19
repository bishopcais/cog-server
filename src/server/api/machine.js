'use strict';

const Machine = require('../models/machine');
const _ = require('lodash');

module.exports = function(req, res) {
  const query = req.query ? _.cloneDeep(req.query) : {};
  if (query.connected) {
    query.connected = query.connected === 'true';
  }
  const args = [];

  if (query['$unwind']) {
    args.push({ $unwind: query['$unwind'] });
    delete query['$unwind'];
  }

  args.push({ $match: query });

  const limit = Number(query['$limit']);
  if (limit) {
    args.push({ $limit: limit });
    delete query['$limit'];
  }

  Machine.aggregate(args).exec((err, machines) => {
    if (err) {
      res.status(400).json({ error: err });
    }
    else {
      res.send({ entries: machines });
    }
  });
};
