var Machine = require('../models/machine');
var _ = require('lodash');

module.exports = function(req, res) {
  var query = req.query ? _.cloneDeep(req.query) : {};
  var args = [];

  if (query['$unwind']) {
    args.push({ $unwind: query['$unwind'] });
    delete query['$unwind'];
  }

  var limit = Number(query['$limit']);
  if (limit) {
    args.push({ $limit: limit });
    delete query['$limit'];
  }

  args.push({ $match: query });

  Machine.aggregate.apply(Machine, args).exec((err, machines) => {
    if (err)
      res.status(400).json({ error: err });
    else
      res.send({ entries: machines });
  })
}