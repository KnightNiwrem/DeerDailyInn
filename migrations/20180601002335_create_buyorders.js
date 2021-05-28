const up = async knex => {
  const hasTable = await knex.schema.hasTable('buyOrders');
  if (!hasTable) {
    await knex.schema.createTable('buyOrders', (table) => {
      table.increments();
      table.integer('amountLeft');
      table.string('item');
      table.integer('maxPrice');
      table.integer('quantity');
      table.integer('telegramId');
      table.timestamps(true, true);

      table.foreign('telegramId').references('users.telegramId');
    });
  }
};

const down = async knex => {
  await knex.schema.dropTable('buyOrders');
};

export { up, down };
