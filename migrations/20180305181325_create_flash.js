exports.up = function(knex, Promise) {
  const hasFlashTable = knex.schema.hasTable('flashes');
  const createFlashTable = hasFlashTable.then((hasTable) => {
    let tableCreation = Promise.resolve();
    if (!hasTable) {
      tableCreation = knex.schema.createTable('flashes', (table) => {
        table.increments();
        table.string('chatId');
        table.string('item');
        table.timestamps(true, true);
      });
    }
    return tableCreation;
  });
  return createFlashTable;  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('flashes');
};
