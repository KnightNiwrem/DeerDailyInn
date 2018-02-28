const _ = require('lodash');
const Promise = require('bluebird');
const { Model } = require('objection');

class User extends Model {
  
  static findOrCreate(attributes) {
    const missingAttributes = this._requiredFields.filter((requiredField) => {
      return _.isNil(attributes) || _.isNil(attributes[requiredField]);
    });
    if (!_.isEmpty(missingAttributes)) {
      return Promise.reject(`User.findOrCreate expects: ${missingAttributes.join(', ')}`);
    }

    // Try to find user, create if not found
    return this.query()
    .where('telegramId', attributes.telegramId)
    .first()
    .then((user) => {
      let foundUser = user;
      if (_.isNil(user)) {
        const newUser = this._construct(attributes)
        foundUser = this.query().insert(newUser).returning('*');
      }
      return foundUser;
    });
  }



  /*************************** Private Methods ***************************/

  static get _requiredFields() {
    return ['telegramId'];
  }

  static _construct(attributes) {
    const user = new User();
    const writableFields = _.pull(this.fields, 'id');
    _.forEach(writableFields, (writableField) => {
      user[writableField] = attributes[writableField];
    });
    return user;
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
    const Deal = require('./deal');
    const Subscription = require('./subscription');
    return {
      purchases: {
        relation: Model.HasManyRelation,
        modelClass: Deal,
        join: {
          from: 'users.chtwrsId',
          to: 'deals.buyerId'
        }
      },
      sales: {
        relation: Model.HasManyRelation,
        modelClass: Deal,
        join: {
          from: 'users.chtwrsId',
          to: 'deals.sellerId'
        }
      },
      subscriptions: {
        relation: Model.HasManyRelation,
        modelClass: Subscription,
        join: {
          from: 'users.id',
          to: 'subscriptions.userId'
        }
      }
    };
  }
}

module.exports = User;
