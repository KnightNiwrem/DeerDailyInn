exports.up = function(knex, Promise) {
  const hasBuyOrderTable = knex.schema.hasTable('buyOrders');
  const createBuyOrderTable = hasBuyOrderTable.then((hasTable) => {
    let tableCreation = Promise.resolve();
    if (!hasTable) {
      tableCreation = knex.schema.createTable('buyOrders', (table) => {
        table.increments();
        table.integer('amountLeft');
        table.string('item');
        table.integer('maxPrice');
        table.integer('quantity');
        table.integer('telegramId');
        table.timestamps(true, true);

        table.foreign('telegramId').references('users.telegramId');
      });
    }
    return tableCreation;
  });
  return createBuyOrderTable;
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('buyOrders');
};
