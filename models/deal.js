const _ = require('lodash');
const Promise = require('bluebird');
const { Model } = require('objection');

class Deal extends Model {
  
  static create(attributes) {
    const missingAttributes = this._requiredFields.filter((requiredField) => {
      return _.isNil(attributes) || _.isNil(attributes[requiredField]);
    });
    if (!_.isEmpty(missingAttributes)) {
      return Promise.reject(`Deal.create expects: ${missingAttributes.join(', ')}`);
    }

    // Try to find user, create if not found
    const deal = this._construct(attributes);
    return this.query().insert(deal).returning('*');
  }

  /*************************** Private Methods ***************************/

  static get _requiredFields() {
    return ['buyerId', 'item', 'price', 'quantity', 'sellerId'];
  }

  static _construct(attributes) {
    const deal = new Deal();
    const writableFields = _.pull(this.fields, 'id');
    _.forEach(writableFields, (writableField) => {
      deal[writableField] = attributes[writableField];
    });
    return deal;
  }

  /*************************** Database Methods ****************************/

  static get tableName() {
    return 'deals';
  }

  static get fields() {
    return _.keys(this.jsonSchema.properties);
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'buyerId', 'item', 'price', 'quantity', 'sellerId'],
      properties: {
        id: {
          type: 'integer'
        },
        buyerId: {
          type: 'string'
        },
        item: {
          type: 'string'
        },
        price: {
          type: 'integer'
        },
        quantity: {
          type: 'integer'
        },
        sellerId: {
          type: 'string'
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
          from: 'deals.userId',
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = Deal;
