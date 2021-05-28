const up = async knex => {
  const hasTable = await knex.schema.hasTable('statuses');
  if (hasTable) {
    await knex.schema.alterTable('statuses', (table) => {
      table.integer('deltaCoffeePrice');
    });
  } 
};

const down = async knex => {
  const hasTable = await knex.schema.hasTable('statuses');
  if (hasTable) {
    await knex.schema.alterTable('statuses', (table) => {
      table.dropColumn('deltaCoffeePrice');
    });
  }
};

export { up, down };
