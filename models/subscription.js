const _ = require('lodash');
const { Model } = require('objection');

class Subscription extends Model {

  static create(attributes) {
    const missingAttributes = this._requiredFields.filter((requiredField) => {
      return _.isNil(attributes) || _.isNil(attributes[requiredField]);
    });
    if (!_.isEmpty(missingAttributes)) {
      return Promise.reject(`Subscription.create expects: ${missingAttributes.join(', ')}`);
    }

    // Try to find user, create if not found
    const subscription = this._construct(attributes);
    return this.query().insert(subscription).returning('*');
  }

  /*************************** Private Methods ***************************/

  static get _requiredFields() {
    return ['expirationDate', 'telegramId'];
  }

  static _construct(attributes) {
    const subscription = new Subscription();
    const writableFields = _.pull(this.fields, 'id');
    _.forEach(writableFields, (writableField) => {
      subscription[writableField] = attributes[writableField];
    });
    return subscription;
  }

  /*************************** Database Methods ****************************/

  static get tableName() {
    return 'subscriptions';
  }

  static get fields() {
    return _.keys(this.jsonSchema.properties);
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'expirationDate', 'telegramId'],
      properties: {
        id: {
          type: 'integer'
        },
        expirationDate: {
          type: 'string',
          format: 'date-time'
        },
        isActive: {
          type: 'boolean',
          default: false
        },
        paymentInfo: {
          type: 'string'
        },
        telegramId: {
          type: 'integer'
        },
      }
    };
  }

  static get relationMappings() {
    const User = require('./user');
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'subscriptions.userId',
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = Subscription;
