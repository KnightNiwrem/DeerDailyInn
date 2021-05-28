const up = async knex => {
  const hasTable = await knex.schema.hasTable('statuses');
  if (!hasTable) {
    await knex.schema.createTable('statuses', (table) => {
      table.increments();
      table.integer('deltaBuyOrderLimit');
      table.string('description').notNullable();
      table.timestamp('expireAt').notNullable();
      table.timestamp('startAt').notNullable();
      table.integer('telegramId').notNullable();
      table.string('title').notNullable();
      table.timestamps(true, true);

      table.foreign('telegramId').references('users.telegramId');
    });
  }
};

const down = async knex => {
  await knex.schema.dropTable('statuses');
};

export { up, down };
