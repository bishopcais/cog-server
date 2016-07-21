var Machine = require('../models/machine');

module.exports = function(req, res) {
  var match = req.query || {};

  Machine.aggregate({ $unwind: '$cogs' }, { $match: match }).exec((err, machines) => {
    if (err)
      res.json({ error: err })
    else
      res.send({ entries: machines })
  })
}