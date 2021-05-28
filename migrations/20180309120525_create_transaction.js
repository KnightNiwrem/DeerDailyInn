const up = async knex => {
  const hasTable = await knex.schema.hasTable('transactions');
  if (!hasTable) {
    await knex.schema.createTable('transactions', (table) => {
      table.increments();
      table.integer('fromId').notNullable();
      table.integer('quantity').notNullable();
      table.string('reason').notNullable();
      table.string('status').notNullable();
      table.integer('toId').notNullable();
      table.timestamps(true, true);

      table.foreign('fromId').references('users.id');
      table.foreign('toId').references('users.id');
    });
  }
};

const down = async knex => {
  await knex.schema.dropTable('transactions');
};

export { up, down };
