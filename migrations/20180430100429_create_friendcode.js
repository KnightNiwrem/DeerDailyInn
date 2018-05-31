exports.up = function(knex, Promise) {
  const hasFriendCodeTable = knex.schema.hasTable('friendCodes');
  const createFriendCodeTable = hasFriendCodeTable.then((hasTable) => {
    let tableCreation = Promise.resolve();
    if (!hasTable) {
      tableCreation = knex.schema.createTable('friendCodes', (table) => {
        table.increments();
        table.integer('telegramId').notNullable();
        table.string('friendCode').notNullable();
        table.timestamps(true, true);

        table.foreign('telegramId').references('users.telegramId');
      });
    }
    return tableCreation;
  });
  return createFriendCodeTable;  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('friendCodes');
};
