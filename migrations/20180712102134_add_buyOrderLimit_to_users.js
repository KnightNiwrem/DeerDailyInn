exports.up = function(knex, Promise) {
  const hasUserTable = knex.schema.hasTable('users');
  const changeUserTable = hasUserTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('users', (table) => {
        table.integer('buyOrderLimit').defaultTo(5);
      });
    }
    return tableChanges;
  });
  return changeUserTable;  
};

exports.down = function(knex, Promise) {
  const hasUserTable = knex.schema.hasTable('users');
  const changeUserTable = hasUserTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('users', (table) => {
        table.dropColumn('buyOrderLimit');
      });
    }
    return tableChanges;
  });
  return changeUserTable; 
};
