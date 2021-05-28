const up = async knex => {
  const hasTable = await knex.schema.hasTable('deals');
  if (!hasTable) {
    await knex.schema.createTable('deals', (table) => {
      table.increments();
      table.string('buyerId');
      table.string('item');
      table.integer('price');
      table.integer('quantity');
      table.string('sellerId');
      table.timestamps(true, true);
    });
  }
};

const down = async knex => {
  await knex.schema.dropTable('deals');
};

export { up, down };
