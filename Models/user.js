const _ = require('lodash');
const { Model } = require('objection');

class User extends Model {
  
  static findOrCreate(userAttributes) {
    const missingAttributes = this._requiredFields.filter((requiredField) => {
      return _.isNil(userAttributes) || _.isNil(userAttributes[requiredField]);
    });
    if (!_.isEmpty(missingAttributes)) {
      return Promise.reject(`User.findOrCreate expects: ${missingAttributes.join(', ')}`);
    }

    // Try to find user, create if not found
    const user = this._construct(userAttributes);
    const userPromise = this.query().where('telegramId', userAttributes.telegramId)
    .then((users) => {
      let returnedUser = null;
      if (_.isEmpty(users)) {
        returnedUser = this.query().insert(user);
      } else {
        returnedUser = Promise.resolve(users[0]);
      }
      return returnedUser;
    });
    return userPromise;
  }



  /*************************** Private Methods ***************************/

  static _requiredFields() {
    return ['telegramId'];
  }

  static _construct(userAttributes) {
    const user = new User();
    _.forEach(writableFields, (writableField) => {
      if (writableField === 'id') {
        return;
      }
      user[writableField] = userAttributes[writableField];
    });
    return user;
  }

  static _isValidAttributes(userAttributes) {
    const requiredFields = this._requiredFields(userAttributes);
    const missingFields = _.filter(requiredFields, (requiredField) => {
      return _.isNil(userAttributes) || _.isNil(userAttributes[requiredField]);
    });

    return missingFields.length === 0;
  }

  /*************************** Database Methods ****************************/

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
