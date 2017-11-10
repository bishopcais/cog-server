'use strict';

module.exports = (sequelize, DataTypes) => {
  let cog = sequelize.define('cog', {
    id: {type: DataTypes.STRING, primaryKey: true},
    machine_id: {type: DataTypes.INTEGER, primaryKey: true},
    type: DataTypes.STRING,
    tags: {type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: null},
    description: DataTypes.STRING,
    pid: DataTypes.STRING,
    host: DataTypes.STRING,
    port: DataTypes.STRING,
    cwd: DataTypes.STRING,
    run: DataTypes.STRING,
    args: DataTypes.ARRAY(DataTypes.STRING),
    status: DataTypes.STRING,
    exit_code: DataTypes.INTEGER
  }, {
    underscored: true,
    freezeTableName: true,
    timestamps: false,
    tableName: 'crun_cog',
    indexes: [
      {
        unique: true,
        fields: ['id', 'machine_id']
      }
    ]
  });

  cog.associate = (models) => {
    cog.belongsTo(models.machine, {
      onDelete: 'CASCADE'
    });
  };

  return cog;
};
