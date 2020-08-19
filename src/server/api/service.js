'use strict';

const Service = require('../models/service');

function getService(req, res) {
  console.log(req);
  res.json({done: true});
}

function postService(req, res) {
  req.body.port = Number.isInteger(req.body.port) ? req.body.port : null;
  req.body.pid = Number.isInteger(req.body.pid) ? req.body.pid : null;
  req.body.protocol = (req.body.protocol || 'http').toLowerCase();
  if (!['http', 'https'].includes(req.body.protocol)) {
    req.body.protocol = 'http';
  }

  req.body.lastModified = new Date();

  if (req.body.id) {
    const id = req.body.id;
    delete req.body.id;
    Service.updateOne({_id: id}, req.body, (err) => {
      if (err) {
        return res.json({status: 'error', message: `${err}`});
      }
      return res.json({status: 'updated'});
    });
  }
  else {
    Service.create(req.body, (err) => {
      if (err) {
        return res.json({status: 'error', message: `${err}`});
      }
      return res.json({status: 'created'});
    });
  }
}

function deleteService(req, res) {
  Service.findByIdAndDelete(req.body.id, (err) => {
    if (err) {
      return res.json({status: 'error', message: err});
    }
    res.json({status: 'deleted'});
  });
}

module.exports = (req, res) => {
  switch (req.method) {
    case 'POST':
      return postService(req, res);
    case 'DELETE':
      return deleteService(req, res);
    default:
      return getService(req, res);
  }
};
