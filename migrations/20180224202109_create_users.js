const up = async knex => {
  const hasTable = await knex.schema.hasTable('users');
  if (!hasTable) {
    await knex.schema.createTable('users', (table) => {
      table.increments();
      table.string('chtwrsId');
      table.string('chtwrsToken');
      table.integer('telegramId');
      table.timestamps(true, true);

      table.unique('telegramId');
    });
  }
};

const down = async knex => {
  await knex.schema.dropTable('users');
};

export { up, down };
