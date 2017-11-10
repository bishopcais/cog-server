let models = require('../models');

module.exports = function(req, res) {
  if (req.method === 'POST') {
    models.user.findOne({where: {username: req.body.username, password: req.body.password}}).then((user) => {
      if (!user) {
        res.status(400).send({ error: 'No user found' });
      }
      else {
        req.session.username = user.username;
        res.send({ username: req.session.username });
      }
    });
  }
  else if (req.method === 'DELETE') {
    req.session.username = undefined;
    res.send({});
  }
  else {
    res.send({ username: req.session.username });
  }
};
