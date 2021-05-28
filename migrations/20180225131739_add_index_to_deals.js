const up = async knex => {
  const hasTable = await knex.schema.hasTable('deals');
  if (hasTable) {
    await knex.schema.alterTable('deals', (table) => {
      table.index('buyerId');
      table.index('sellerId');
    });
  }
};

const down = async knex => {
  const hasTable = await knex.schema.hasTable('deals');
  if (hasTable) {
    await knex.schema.alterTable('deals', (table) => {
      table.dropIndex('buyerId');
      table.dropIndex('sellerId');
    });
  }
};

export { up, down };
