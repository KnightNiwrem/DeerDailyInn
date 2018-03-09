exports.up = function(knex, Promise) {
  const hasTransactionTable = knex.schema.hasTable('transactions');
  const createTransactionTable = hasTransactionTable.then((hasTable) => {
    let tableCreation = Promise.resolve();
    if (!hasTable) {
      tableCreation = knex.schema.createTable('transactions', (table) => {
        table.increments();
        table.integer('fromId').notNullable();
        table.boolean('isCommitted').notNullable();
        table.integer('quantity').notNullable();
        table.string('reason').notNullable();
        table.integer('toId').notNullable();
        table.timestamps(true, true);
      });
    }
    return tableCreation;
  });
  return createTransactionTable;  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('transactions');
};
