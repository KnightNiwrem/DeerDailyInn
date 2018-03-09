exports.up = function(knex, Promise) {
  const hasUserTable = knex.schema.hasTable('users');
  const changeUserTable = hasUserTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('users', (table) => {
        table.integer('balance').defaultTo(0);
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
        table.dropColumn('balance');
      });
    }
    return tableChanges;
  });
  return changeUserTable; 
};
