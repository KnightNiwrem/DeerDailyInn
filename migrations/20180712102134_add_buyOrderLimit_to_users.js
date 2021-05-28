const up = async knex => {
  const hasTable = await knex.schema.hasTable('users');
  if (hasTable) {
    await knex.schema.alterTable('users', (table) => {
      table.integer('buyOrderLimit').defaultTo(5);
    });
  }
};

const down = async knex => {
  const hasTable = await knex.schema.hasTable('users');
  if (hasTable) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('buyOrderLimit');
    });
  }
};

export { up, down };
