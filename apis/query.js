var Machine = require('../models/machine');

module.exports = function(req, res) {
  filters = req.query || {};

  Machine.find(filters).exec((err, machines) => {
    if (err)
      res.json({ error: err })
    else
      res.send({ entries: machines })
  })
}