const _ = require('lodash');
const Promise = require('bluebird');
const { Model } = require('objection');

class BuyOrder extends Model {
  
  static create(attributes) {
    const missingAttributes = this._requiredFields.filter((requiredField) => {
      return _.isNil(attributes) || _.isNil(attributes[requiredField]);
    });
    if (!_.isEmpty(missingAttributes)) {
      return Promise.reject(`BuyOrder.create expects: ${missingAttributes.join(', ')}`);
    }

    // Try to find user, create if not found
    const buyOrder = this._construct(attributes);
    return this.query().insert(buyOrder).returning('*');
  }

  /*************************** Private Methods ***************************/

  static get _requiredFields() {
    return ['amountLeft', 'item', 'maxPrice', 'quantity', 'telegramId'];
  }

  static _construct(attributes) {
    const buyOrder = new BuyOrder();
    const writableFields = _.pull(this.fields, 'id');
    _.forEach(writableFields, (writableField) => {
      buyOrder[writableField] = attributes[writableField];
    });
    return buyOrder;
  }

  /*************************** Database Methods ****************************/

  static get tableName() {
    return 'buyOrders';
  }

  static get fields() {
    return _.keys(this.jsonSchema.properties);
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'amountLeft', 'item', 'maxPrice', 'quantity', 'telegramId'],
      properties: {
        id: {
          type: 'integer'
        },
        amountLeft: {
          type: 'integer'
        },
        item: {
          type: 'string'
        },
        maxPrice: {
          type: 'integer'
        },
        quantity: {
          type: 'integer'
        },
        telegramId: {
          type: 'integer'
        }
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
          from: 'buyOrders.telegramId',
          to: 'users.telegramId'
        }
      }
    };
  }
}

module.exports = BuyOrder;
