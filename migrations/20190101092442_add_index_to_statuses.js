const up = async knex => {
  const hasTable = await knex.schema.hasTable('statuses');
  if (hasTable) {
    await knex.schema.alterTable('statuses', (table) => {
      table.index('expireAt');
      table.index('startAt');
    });
  }
};

const down = async knex => {
  const hasTable = await knex.schema.hasTable('statuses');
  if (hasTable) {
    await knex.schema.alterTable('statuses', (table) => {
      table.dropIndex('expireAt');
      table.dropIndex('startAt');
    });
  }
};

export { up, down };
