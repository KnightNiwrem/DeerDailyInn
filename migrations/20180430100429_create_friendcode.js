const up = async knex => {
  const hasTable = await knex.schema.hasTable('friendCodes');
  if (!hasTable) {
    await knex.schema.createTable('friendCodes', (table) => {
      table.increments();
      table.integer('telegramId').notNullable();
      table.string('friendCode').notNullable();
      table.timestamps(true, true);

      table.foreign('telegramId').references('users.telegramId');
    });
  }
};

const down = async knex => {
  await knex.schema.dropTable('friendCodes');
};

export { up, down };
