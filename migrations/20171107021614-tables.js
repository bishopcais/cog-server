'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable('crun_user', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: true
        },
        username: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: true
        },
        is_admin: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false
        },
        name: {
          type: Sequelize.STRING,
          defaultValue: ''
        },
        email: {
          type: Sequelize.STRING
        }
      }).then(() => {
        queryInterface.createTable('crun_user_key', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            notNull: true
          },
          user_id: {
            type: Sequelize.INTEGER,
            notNull: true,
            references: {
              model: 'crun_user',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          key: {
            type: Sequelize.STRING,
            allowNull: true
          }
        }).then(() => { queryInterface.addIndex('crun_user_key', ['user_id', 'key']); })
      }),
      queryInterface.createTable('crun_machine', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          notNull: true
        },
        connected: Sequelize.BOOLEAN,
        last_connected: Sequelize.DATE,
        last_disconnected: Sequelize.DATE,
        platform: Sequelize.STRING,
        pid: Sequelize.INTEGER,
        user: Sequelize.STRING,
        username: Sequelize.STRING,
        interfaces: Sequelize.JSONB,
        hostname: Sequelize.STRING,
        cpus: Sequelize.JSONB,
        memory: Sequelize.FLOAT
      }).then(() => {
        queryInterface.createTable('crun_cog', {
          id: {
            type: Sequelize.STRING,
            primaryKey: true,
            notNull: true
          },
          machine_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            notNull: true,
            references: {
              model: 'crun_machine',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          type: Sequelize.STRING,
          tags: {type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: null},
          description: Sequelize.STRING,
          pid: Sequelize.STRING,
          host: Sequelize.STRING,
          port: Sequelize.STRING,
          cwd: Sequelize.STRING,
          run: Sequelize.STRING,
          args: Sequelize.ARRAY(Sequelize.STRING),
          status: Sequelize.STRING,
          exit_code: Sequelize.INTEGER
        }).then(() => { queryInterface.addIndex('crun_cog', ['id', 'machine_id']); })
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable('crun_user_key').then(() => {
        queryInterface.dropTable('crun_user')
      }),
      queryInterface.dropTable('crun_cog').then(() => {
        queryInterface.dropTable('crun_machine')
      })
    ]);
  }
};
