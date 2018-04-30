const _ = require('lodash');
const Promise = require('bluebird');
const { Model } = require('objection');

class FriendCode extends Model {
  
  static create(attributes) {
    const missingAttributes = this._requiredFields.filter((requiredField) => {
      return _.isNil(attributes) || _.isNil(attributes[requiredField]);
    });
    if (!_.isEmpty(missingAttributes)) {
      return Promise.reject(`FriendCode.create expects: ${missingAttributes.join(', ')}`);
    }

    const friendCode = this._construct(attributes);
    return this.query().insert(friendCode).returning('*');
  }

  /*************************** Private Methods ***************************/

  static get _requiredFields() {
    return ['telegramId', 'friendCode'];
  }

  static _construct(attributes) {
    const friendCode = new FriendCode();
    const writableFields = _.pull(this.fields, 'id');
    _.forEach(writableFields, (writableField) => {
      friendCode[writableField] = attributes[writableField];
    });
    return friendCode;
  }

  /*************************** Database Methods ****************************/

  static get tableName() {
    return 'friendCodes';
  }

  static get fields() {
    return _.keys(this.jsonSchema.properties);
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'telegramId', 'friendCode'],
      properties: {
        id: {
          type: 'integer'
        },
        telegramId: {
          type: 'integer'
        },
        friendCode: {
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
          from: 'friendCodes.telegramId',
          to: 'users.telegramId'
        }
      }
    };
  }
}

module.exports = FriendCode;
