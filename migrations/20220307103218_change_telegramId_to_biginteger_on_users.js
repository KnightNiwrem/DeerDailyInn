const up = async knex => {
  const hasTable = await knex.schema.hasTable('users');
  if (hasTable) {
    await knex.schema.alterTable('users', (table) => {
      table.biginteger('telegramId');
    });
  }
};

const down = async knex => {
  const hasTable = await knex.schema.hasTable('users');
  if (hasTable) {
    await knex.schema.alterTable('users', (table) => {
      table.integer('telegramId');
    });
  }
};

export { up, down };
