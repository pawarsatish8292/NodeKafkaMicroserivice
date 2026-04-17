'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const table = await queryInterface.describeTable('Users');

    // ✅ 1. Remove email only if exists
    if (table.email) {
      await queryInterface.removeColumn('Users', 'email');
    }

    // ✅ 2. Add user_id only if not exists
    if (!table.user_id) {
      await queryInterface.addColumn('Users', 'user_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    // ✅ 3. Backfill
    await queryInterface.sequelize.query(`
      UPDATE Users SET user_id = id WHERE user_id IS NULL
    `);

    // ✅ 4. Make NOT NULL + UNIQUE
    await queryInterface.changeColumn('Users', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');

    if (table.user_id) {
      await queryInterface.removeColumn('Users', 'user_id');
    }

    if (!table.email) {
      await queryInterface.addColumn('Users', 'email', {
        type: Sequelize.STRING,
        unique: true,
      });
    }
  },
};