const up = async knex => {
  const hasTable = await knex.schema.hasTable('users');
  if (hasTable) {
    await knex.schema.alterTable('users', (table) => {
      table.unique('chtwrsId');
    });
  }
};

const down = async knex => {
  const hasTable = await knex.schema.hasTable('users');
  if (hasTable) {
    await knex.schema.alterTable('users', (table) => {
      table.dropUnique('chtwrsId');
    });
  }
};

export { up, down };
