exports.up = function(knex, Promise) {
  const hasUserTable = knex.schema.hasTable('users');
  const createUserTable = hasUserTable.then((hasTable) => {
    let tableCreation = Promise.resolve();
    if (!hasTable) {
      tableCreation = knex.schema.createTable('users', (table) => {
        table.increments();
        table.string('chtwrsId');
        table.string('chtwrsToken');
        table.integer('telegramId');
        table.timestamps();

        table.unique('telegramId');
      });
    }
    return tableCreation;
  });
  return createUserTable;
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
