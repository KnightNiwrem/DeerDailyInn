const up = async knex => {
  const hasTable = await knex.schema.hasTable('users');
  if (hasTable) {
    await knex.schema.alterTable('users', (table) => {
      table.integer('balance').defaultTo(0);
    });
  }
};

const down = async knex => {
  const hasTable = await knex.schema.hasTable('users');
  if (hasTable) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('balance');
    });
  }
};

export { up, down };
