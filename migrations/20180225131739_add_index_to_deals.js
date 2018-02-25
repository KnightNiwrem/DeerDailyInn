exports.up = function(knex, Promise) {
  const hasDealTable = knex.schema.hasTable('deals');
  const changeDealTable = hasDealTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (!hasTable) {
      tableChanges = knex.schema.alterTable('deals', (table) => {
        table.index('buyerId');
        table.index('sellerId');
      });
    }
    return tableChanges;
  });
  return changeDealTable;  
};

exports.down = function(knex, Promise) {
  const hasDealTable = knex.schema.hasTable('deals');
  const changeDealTable = hasDealTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (!hasTable) {
      tableChanges = knex.schema.alterTable('deals', (table) => {
        table.dropIndex('buyerId');
        table.dropIndex('sellerId');
      });
    }
    return tableChanges;
  });
  return changeDealTable; 
};
