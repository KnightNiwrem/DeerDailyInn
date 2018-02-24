const _ = require('lodash');
const { Model } = require('objection');

class Subscription extends Model {
  static get tableName() {
    return 'subscriptions';
  }

  static get fields() {
    return _.keys(this.jsonSchema.properties);
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'duration', 'telegramId'],
      properties: {
        id: {
          type: 'integer'
        },
        active: {
          type: 'boolean',
          default: false
        }
        duration: {
          type: 'integer'
        }
        paymentInfo: {
          type: 'string'
        }
        telegramId: {
          type: 'integer'
        },
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/cat.js`,
        join: {
          from: 'subscriptions.telegramId',
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = User;
