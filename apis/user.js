'use strict';
let models = require('../models');

module.exports = (req, res) => {
  models.user.findOne({
    where: {'username': 'admin'},
    include: [{model: models.key}]
  }).then((user) => {
    res.send(user);
  });
};
