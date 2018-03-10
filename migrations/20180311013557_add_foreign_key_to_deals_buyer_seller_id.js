exports.up = function(knex, Promise) {
  const hasDealTable = knex.schema.hasTable('deals');
  const changeDealTable = hasDealTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('deals', (table) => {
        table.foreign('buyerId').references('users.chtwrsId');
        table.foreign('sellerId').references('users.chtwrsId');
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
    if (hasTable) {
      tableChanges = knex.schema.alterTable('deals', (table) => {
        table.dropForeign('buyerId');
        table.dropForeign('sellerId');
      });
    }
    return tableChanges;
  });
  return changeDealTable; 
};
