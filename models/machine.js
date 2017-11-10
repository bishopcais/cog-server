'use strict';

module.exports = (sequelize, DataTypes) => {
  let machine = sequelize.define('machine', {
    connected: DataTypes.BOOLEAN,
    last_connected: DataTypes.DATE,
    last_disconnected: DataTypes.DATE,
    platform: DataTypes.STRING,
    pid: DataTypes.INTEGER,
    user: DataTypes.STRING,
    username: DataTypes.STRING,
    interfaces: DataTypes.JSONB,
    hostname: DataTypes.STRING,
    cpus: DataTypes.JSONB,
    memory: DataTypes.FLOAT
  }, {
    underscored: true,
    freezeTableName: true,
    timestamps: false,
    tableName: 'crun_machine'
  });

  machine.associate = (models) => {
    machine.hasMany(models.cog);
  };

  return machine;
};
