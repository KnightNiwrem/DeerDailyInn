const _ = require('lodash');
const Promise = require('bluebird');
const { Model } = require('objection');

class Transaction extends Model {
  
  static create(attributes) {
    const missingAttributes = this._requiredFields.filter((requiredField) => {
      return _.isNil(attributes) || _.isNil(attributes[requiredField]);
    });
    if (!_.isEmpty(missingAttributes)) {
      return Promise.reject(`Transaction.create expects: ${missingAttributes.join(', ')}`);
    }

    // Try to find user, create if not found
    const transaction = this._construct(attributes);
    return this.query().insert(transaction).returning('*');
  }

  /*************************** Private Methods ***************************/

  static get _requiredFields() {
    return ['isCommitted', 'quantity', 'reason'];
  }

  static _construct(attributes) {
    const transaction = new Transaction();
    const writableFields = _.pull(this.fields, 'id');
    _.forEach(writableFields, (writableField) => {
      transaction[writableField] = attributes[writableField];
    });
    return transaction;
  }

  /*************************** Database Methods ****************************/

  static get tableName() {
    return 'transactions';
  }

  static get fields() {
    return _.keys(this.jsonSchema.properties);
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'fromId', 'isCommitted', 'quantity', 'reason', 'toId'],
      properties: {
        id: {
          type: 'integer'
        },
        fromId: {
          type: 'integer',
          default: 0
        },
        isCommitted: {
          type: 'boolean'
        },
        quantity: {
          type: 'integer'
        },
        reason: {
          type: 'string'
        },
        toId: {
          type: 'integer',
          default: 0
        }
      }
    };
  }

  static get relationMappings() {
    const User = require('./user');
    return {
      source: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'transactions.fromId',
          to: 'users.id'
        }
      },
      destination: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'transactions.toId',
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = Transaction;
