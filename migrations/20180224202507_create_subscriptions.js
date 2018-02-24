exports.up = function(knex, Promise) {
  const hasSubscriptionTable = knex.schema.hasTable('subscriptions');
  const createSubscriptionTable = hasSubscriptionTable.then((hasTable) => {
    let tableCreation = Promise.resolve();
    if (!hasTable) {
      tableCreation = knex.schema.createTable('subscriptions', (table) => {
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
    return tableCreation;
  });
  return createSubscriptionTable;
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('subscriptions');
};
