exports.up = function(knex, Promise) {
  const hasStatusTable = knex.schema.hasTable('statuses');
  const changeStatusTable = hasStatusTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('statuses', (table) => {
        table.integer('deltaCoffeePrice');
      });
    }
    return tableChanges;
  });
  return changeStatusTable;  
};

exports.down = function(knex, Promise) {
  const hasStatusTable = knex.schema.hasTable('statuses');
  const changeStatusTable = hasStatusTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('statuses', (table) => {
        table.dropColumn('deltaCoffeePrice');
      });
    }
    return tableChanges;
  });
  return changeStatusTable; 
};
