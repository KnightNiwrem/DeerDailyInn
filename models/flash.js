const _ = require('lodash');
const Promise = require('bluebird');
const { Model } = require('objection');

class Flash extends Model {
  
  static create(attributes) {
    const missingAttributes = this._requiredFields.filter((requiredField) => {
      return _.isNil(attributes) || _.isNil(attributes[requiredField]);
    });
    if (!_.isEmpty(missingAttributes)) {
      return Promise.reject(`Flash.create expects: ${missingAttributes.join(', ')}`);
    }

    // Try to find user, create if not found
    const flash = this._construct(attributes);
    return this.query().insert(flash).returning('*');
  }

  /*************************** Private Methods ***************************/

  static get _requiredFields() {
    return ['chatId', 'item'];
  }

  static _construct(attributes) {
    const flash = new Flash();
    const writableFields = _.pull(this.fields, 'id');
    _.forEach(writableFields, (writableField) => {
      flash[writableField] = attributes[writableField];
    });
    return flash;
  }

  /*************************** Database Methods ****************************/

  static get tableName() {
    return 'flashes';
  }

  static get fields() {
    return _.keys(this.jsonSchema.properties);
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'chatId', 'item'],
      properties: {
        id: {
          type: 'integer'
        },
        chatId: {
          type: 'string'
        },
        item: {
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
          from: 'flashes.chatId',
          to: 'users.telegramId'
        }
      }
    };
  }
}

module.exports = Flash;
