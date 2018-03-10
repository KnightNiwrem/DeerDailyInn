exports.up = function(knex, Promise) {
  const hasTreasureHunterPlayerTable = knex.schema.hasTable('treasureHunterPlayers');
  const changeTreasureHunterPlayerTable = hasTreasureHunterPlayerTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('treasureHunterPlayers', (table) => {
        table.integer('choice');
      });
    }
    return tableChanges;
  });
  return changeTreasureHunterPlayerTable;  
};

exports.down = function(knex, Promise) {
  const hasTreasureHunterPlayerTable = knex.schema.hasTable('treasureHunterPlayers');
  const changeTreasureHunterPlayerTable = hasTreasureHunterPlayerTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('treasureHunterPlayers', (table) => {
        table.dropColumn('choice');
      });
    }
    return tableChanges;
  });
  return changeTreasureHunterPlayerTable; 
};
