const User = require('../models/user');

module.exports = function(req, res) {
  if (req.method === 'POST') {
    User.authenticate(req.body, (error, user) => {
      if (error) {
        res.status(400).send({ error: error });
      }
      else {
        req.session.username = user.username;
        res.send({ username: req.session.username });
      }
    });
  }
  else if (req.method == 'DELETE') {
    req.session.username = undefined;
    res.send({});
  }
  else {
    res.send({ username: req.session.username });
  }
};
