const up = async knex => {
  const hasTable = await knex.schema.hasTable('subscriptions');
  if (!hasTable) {
    await knex.schema.createTable('subscriptions', (table) => {
      table.increments();
      table.string('expirationDate');
      table.boolean('isActive');
      table.string('paymentInfo');
      table.integer('telegramId');
      table.integer('userId');
      table.timestamps(true, true);

      table.foreign('userId').references('users.id');
    });
  }
};

const down = async knex => {
  await knex.schema.dropTable('subscriptions');
};

export { up, down };
