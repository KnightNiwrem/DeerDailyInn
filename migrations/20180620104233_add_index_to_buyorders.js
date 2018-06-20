exports.up = function(knex, Promise) {
  const hasBuyOrderTable = knex.schema.hasTable('buyOrders');
  const changeBuyOrderTable = hasBuyOrderTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('buyOrders', (table) => {
        table.index('amountLeft');
        table.index('maxPrice');
      });
    }
    return tableChanges;
  });
  return changeBuyOrderTable;  
};

exports.down = function(knex, Promise) {
  const hasBuyOrderTable = knex.schema.hasTable('buyOrders');
  const changeBuyOrderTable = hasBuyOrderTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('buyOrders', (table) => {
        table.dropIndex('amountLeft');
        table.dropIndex('maxPrice');
      });
    }
    return tableChanges;
  });
  return changeBuyOrderTable; 
};
