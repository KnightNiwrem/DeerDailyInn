const up = async knex => {
  const hasTable = await knex.schema.hasTable('buyOrders');
  if (hasTable) {
    await knex.schema.alterTable('buyOrders', (table) => {
      table.index('amountLeft');
      table.index('maxPrice');
    });
  }
};

const down = async knex => {
  const hasTable = await knex.schema.hasTable('buyOrders');
  if (hasTable) {
    await knex.schema.alterTable('buyOrders', (table) => {
      table.dropIndex('amountLeft');
      table.dropIndex('maxPrice');
    });
  }
};

export { up, down };
