const up = async knex => {
  const hasTable = await knex.schema.hasTable('subscriptions');
  if (hasTable) {
    await knex.schema.alterTable('subscriptions', (table) => {
      table.timestamp('expirationDate').notNullable().alter();
    });
  }
};

const down = async knex => {
  const hasTable = await knex.schema.hasTable('subscriptions');
  if (hasTable) {
    await knex.schema.alterTable('subscriptions', (table) => {
      table.string('expirationDate').alter();
    });
  }
};

export { up, down };
