exports.up = function(knex, Promise) {
  const hasStatusTable = knex.schema.hasTable('statuses');
  const changeStatusTable = hasStatusTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('statuses', (table) => {
        table.index('expireAt');
        table.index('startAt');
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
        table.dropIndex('expireAt');
        table.dropIndex('startAt');
      });
    }
    return tableChanges;
  });
  return changeStatusTable; 
};
