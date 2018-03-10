exports.up = function(knex, Promise) {
  const hasTreasureHunterPlayerTable = knex.schema.hasTable('treasureHunterPlayers');
  const createTreasureHunterPlayerTable = hasTreasureHunterPlayerTable.then((hasTable) => {
    let tableCreation = Promise.resolve();
    if (!hasTable) {
      tableCreation = knex.schema.createTable('treasureHunterPlayers', (table) => {
        table.increments();
        table.integer('gameId');
        table.integer('outcome');
        table.integer('userId');
        table.timestamps(true, true);

        table.foreign('gameId').references('treasureHunterGames.id');
        table.foreign('userId').references('users.id');
      });
    }
    return tableCreation;
  });
  return createTreasureHunterPlayerTable;  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('treasureHunterPlayers');
};
