const _ = require('lodash');
const Promise = require('bluebird');
const { Model } = require('objection');

class Status extends Model {
  
  static create(attributes) {
    const missingAttributes = this._requiredFields.filter((requiredField) => {
      return _.isNil(attributes) || _.isNil(attributes[requiredField]);
    });
    if (!_.isEmpty(missingAttributes)) {
      return Promise.reject(`Status.create expects: ${missingAttributes.join(', ')}`);
    }

    const status = this._construct(attributes);
    return this.query().insert(status).returning('*');
  }

  /*************************** Private Methods ***************************/

  static get _requiredFields() {
    return ['description', 'expireAt', 'startAt', 'telegramId', 'title'];
  }

  static _construct(attributes) {
    const status = new Status();
    const writableFields = _.pull(this.fields, 'id');
    _.forEach(writableFields, (writableField) => {
      status[writableField] = attributes[writableField];
    });
    return status;
  }

  /*************************** Database Methods ****************************/

  static get tableName() {
    return 'statuses';
  }

  static get fields() {
    return _.keys(this.jsonSchema.properties);
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'expireAt', 'startAt', 'telegramId'],
      properties: {
        id: {
          type: 'integer'
        },
        deltaBuyOrderLimit: {
          type: 'integer'
        },
        description: {
          type: 'string'
        },
        expireAt: {
          type: 'string',
          format: 'date-time'
        },
        startAt: {
          type: 'string',
          format: 'date-time'
        },
        telegramId: {
          type: 'integer'
        },
        title: {
          type: 'string'
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
          from: 'statuses.telegramId',
          to: 'users.telegramId'
        }
      }
    };
  }
}

module.exports = Status;
