const up = async knex => {
  const hasTable = await knex.schema.hasTable('flashes');
  if (!hasTable) {
    await knex.schema.createTable('flashes', (table) => {
      table.increments();
      table.string('chatId');
      table.string('item');
      table.timestamps(true, true);
    });
  }
};

const down = async knex => {
  await knex.schema.dropTable('flashes');
};

export { up, down };
