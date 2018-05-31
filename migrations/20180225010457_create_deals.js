exports.up = function(knex, Promise) {
  const hasDealTable = knex.schema.hasTable('deals');
  const createDealTable = hasDealTable.then((hasTable) => {
    let tableCreation = Promise.resolve();
    if (!hasTable) {
      tableCreation = knex.schema.createTable('deals', (table) => {
        table.increments();
        table.string('buyerId');
        table.string('item');
        table.integer('price');
        table.integer('quantity');
        table.string('sellerId');
        table.timestamps(true, true);
      });
    }
    return tableCreation;
  });
  return createDealTable;  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('deals');
};
