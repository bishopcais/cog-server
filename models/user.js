'use strict';

module.exports = (sequelize, DataTypes) => {
  let user = sequelize.define('user', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    is_admin: {type: DataTypes.BOOLEAN, defaultValue: false},
    name: {type: DataTypes.STRING, defaultValue: ''},
    email: DataTypes.STRING
  }, {
    underscored: true,
    freezeTableName: true,
    timestamps: false,
    tableName: 'crun_user'
  });

  user.associate = (models) => {
    user.hasMany(models.key);
  };

  return user;
};
