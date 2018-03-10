exports.up = function(knex, Promise) {
  const hasTreasureHunterGameTable = knex.schema.hasTable('treasureHunterGames');
  const createTreasureHunterGameTable = hasTreasureHunterGameTable.then((hasTable) => {
    let tableCreation = Promise.resolve();
    if (!hasTable) {
      tableCreation = knex.schema.createTable('treasureHunterGames', (table) => {
        table.increments();
        table.string('chatId');
        table.string('status');
        table.timestamps(true, true);
      });
    }
    return tableCreation;
  });
  return createTreasureHunterGameTable;  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('treasureHunterGames');
};
