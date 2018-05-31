const _ = require('lodash');
const Promise = require('bluebird');
const { Model } = require('objection');

class Transaction extends Model {
  
  static create(attributes, transactionObject) {
    const missingAttributes = this._requiredFields.filter((requiredField) => {
      return _.isNil(attributes) || _.isNil(attributes[requiredField]);
    });
    if (!_.isEmpty(missingAttributes)) {
      return Promise.reject(`Transaction.create expects: ${missingAttributes.join(', ')}`);
    }

    // Try to find user, create if not found
    const transaction = this._construct(attributes);
    const queryObject = _.isNil(transactionObject) ? this.query() : this.query(transactionObject);
    return queryObject.insert(transaction).returning('*');
  }

  /*************************** Private Methods ***************************/

  static get _requiredFields() {
    return ['quantity', 'reason', 'status'];
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
      required: ['id', 'apiStatus', 'fromId', 'quantity', 'reason', 'status', 'toId'],
      properties: {
        id: {
          type: 'integer'
        },
        apiStatus: {
          type: 'string'
        },
        fromId: {
          type: 'integer',
          default: 0
        },
        quantity: {
          type: 'integer'
        },
        reason: {
          type: 'string',
        },
        status: {
          type: 'string',
          enum: ['cancelled', 'completed', 'pending', 'started']
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
