exports.up = function(knex, Promise) {
  const hasStatusTable = knex.schema.hasTable('statuses');
  const createStatusTable = hasStatusTable.then((hasTable) => {
    let tableCreation = Promise.resolve();
    if (!hasTable) {
      tableCreation = knex.schema.createTable('statuses', (table) => {
        table.increments();
        table.integer('deltaBuyOrderLimit');
        table.string('description').notNullable();
        table.timestamp('expireAt').notNullable();
        table.timestamp('startAt').notNullable();
        table.integer('telegramId').notNullable();
        table.string('title').notNullable();
        table.timestamps(true, true);

        table.foreign('telegramId').references('users.telegramId');
      });
    }
    return tableCreation;
  });
  return createStatusTable;
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('statuses');
};
