'use strict';

module.exports = (sequelize, DataTypes) => {
  let key = sequelize.define('key', {
    key: {type: DataTypes.STRING, allowNull: false}
  }, {
    underscored: true,
    freezeTableName: true,
    timestamps: false,
    tableName: 'crun_user_key',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'key']
      }
    ]
  });

  key.associate = (models) => {
    key.belongsTo(models.user, {
      onDelete: 'CASCADE'
    });
  };

  return key;
};
