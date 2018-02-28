exports.up = function(knex, Promise) {
  const hasSubscriptionTable = knex.schema.hasTable('subscriptions');
  const changeSubscriptionTable = hasSubscriptionTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('subscriptions', (table) => {
        table.timestamp('expirationDate').notNullable().alter();
      });
    }
    return tableChanges;
  });
  return changeSubscriptionTable;
};

exports.down = function(knex, Promise) {
  const hasSubscriptionTable = knex.schema.hasTable('subscriptions');
  const changeSubscriptionTable = hasSubscriptionTable.then((hasTable) => {
    let tableChanges = Promise.resolve();
    if (hasTable) {
      tableChanges = knex.schema.alterTable('subscriptions', (table) => {
        table.string('expirationDate').alter();
      });
    }
    return tableChanges;
  });
  return changeSubscriptionTable;
};
