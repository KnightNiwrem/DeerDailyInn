const _ = require('lodash');
const { Model } = require('objection');

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get fields() {
    return _.keys(this.jsonSchema.properties);
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'telegramId'],
      properties: {
        id: {
          type: 'integer'
        },
        chtwrsId: {
          type: ['string', 'null']
        },
        chtwrsToken: {
          type: ['string', 'null']
        },
        telegramId: {
          type: 'integer'
        },
      }
    };
  }

  static get relationMappings() {
    return {
      subscriptions: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/subscription.js`,
        join: {
          from: 'users.id',
          to: 'subscriptions.telegramId'
        }
      }
    };
  }
}

module.exports = User;
