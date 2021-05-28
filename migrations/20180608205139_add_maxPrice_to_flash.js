const up = async knex => {
  const hasTable = await knex.schema.hasTable('flashes');
  if (hasTable) {
    await knex.schema.alterTable('flashes', (table) => {
      table.integer('maxPrice').notNullable().defaultTo(1000);
    });
  }
};

const down = async knex => {
  const hasTable = await knex.schema.hasTable('flashes');
  if (hasTable) {
    await knex.schema.alterTable('flashes', (table) => {
      table.dropColumn('maxPrice');
    });
  }
};

export { up, down };
