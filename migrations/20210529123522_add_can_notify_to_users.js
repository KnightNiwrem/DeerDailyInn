const up = async knex => {
  const hasTable = await knex.schema.hasTable('users');
  if (hasTable) {
    await knex.schema.alterTable('users', (table) => {
      table.boolean('canNotify').notNullable().defaultTo(true);
    });
  }
};

const down = async knex => {
  const hasTable = await knex.schema.hasTable('users');
  if (hasTable) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('canNotify');
    });
  }
};

export { up, down };
