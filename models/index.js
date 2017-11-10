'use strict';

let fs = require('fs');
let path = require('path');
let Sequelize = require('sequelize');
let config = require(path.join(__dirname, '..', 'cog.json'))['database'];
config['operatorsAliases'] = Sequelize.Op;
// Set this to true if you want to see all the queries that sequelize generates with our models
config['logging'] = false;
let sequelize = new Sequelize(config.database, config.username, config.password, config);

// Contains all of our models
let db = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function(file) {
    let model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
