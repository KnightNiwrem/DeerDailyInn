const up = async knex => {
  const hasTable = await knex.schema.hasTable('transactions');
  if (hasTable) {
    await knex.schema.alterTable('transactions', (table) => {
      table.string('apiStatus');
    });
  }
};

const down = async knex => {
  const hasTable = await knex.schema.hasTable('transactions');
    if (hasTable) {
      await knex.schema.alterTable('transactions', (table) => {
        table.dropColumn('apiStatus');
      });
    }
};

export { up, down };
