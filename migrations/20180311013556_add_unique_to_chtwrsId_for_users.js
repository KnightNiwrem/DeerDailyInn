exports.up = function(knex, Promise) {
  const hasUserTable = knex.schema.hasTable('users');
  const changeUserTable = hasUserTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('users', (table) => {
        table.unique('chtwrsId');
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
        table.dropUnique('chtwrsId');
      });
    }
    return tableChanges;
  });
  return changeUserTable; 
};
