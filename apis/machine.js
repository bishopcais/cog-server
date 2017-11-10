let _ = require('lodash');
let models = require('../models');

module.exports = function(req, res) {
  let query = req.query ? _.cloneDeep(req.query) : {};
  let args = [];

  console.log(query);
  /*
  if (query['$unwind']) {
    args.push({ $unwind: query['$unwind'] });
    delete query['$unwind'];
  }

  args.push({ $match: query });

  let limit = Number(query['$limit']);
  if (limit) {
    args.push({ $limit: limit });
    delete query['$limit'];
  }

  models.machine.aggregate.apply(models.machine, args).exec((err, machines) => {
    if (err) {
      res.status(400).json({ error: err });
    }
    else {
      res.send({ entries: machines });
    }
  });
  */
  res.send({entries: []});
};