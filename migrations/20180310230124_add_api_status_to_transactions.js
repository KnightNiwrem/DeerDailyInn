exports.up = function(knex, Promise) {
  const hasTransactionTable = knex.schema.hasTable('transactions');
  const changeTransactionTable = hasTransactionTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('transactions', (table) => {
        table.string('apiStatus');
      });
    }
    return tableChanges;
  });
  return changeTransactionTable;  
};

exports.down = function(knex, Promise) {
  const hasTransactionTable = knex.schema.hasTable('transactions');
  const changeTransactionTable = hasTransactionTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('transactions', (table) => {
        table.dropColumn('apiStatus');
      });
    }
    return tableChanges;
  });
  return changeTransactionTable; 
};
