exports.up = function(knex, Promise) {
  const hasFlashTable = knex.schema.hasTable('flashes');
  const changeFlashTable = hasFlashTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('flashes', (table) => {
        table.integer('maxPrice').notNullable().defaultTo(1000);
      });
    }
    return tableChanges;
  });
  return changeFlashTable;  
};

exports.down = function(knex, Promise) {
  const hasFlashTable = knex.schema.hasTable('flashes');
  const changeFlashTable = hasFlashTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('flashes', (table) => {
        table.dropColumn('maxPrice');
      });
    }
    return tableChanges;
  });
  return changeFlashTable; 
};
