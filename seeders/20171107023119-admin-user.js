'use strict';

/*
 username: 'admin',
  password: 'password',
  name: 'Admin',
  email: 'admin@admin.com',
  isAdmin: true,
  keys: [
    {
      key: "key"
    }
  ]
*/

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('crun_user', [{
      username: 'admin',
      password: 'password',
      is_admin: true,
      name: 'Admin',
      email: 'admin@example.com'
    }]).then(() => {
      return queryInterface.bulkInsert('crun_user_key', [{
        user_id: 1,
        key: 'key'
      }, {
        user_id: 1,
        key: 'key2'
      }]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('user', [{
      username: 'admin'
    }]);
  }
};
