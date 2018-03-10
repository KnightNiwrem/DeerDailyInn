const _ = require('lodash');
const Promise = require('bluebird');
const { Model } = require('objection');

class TreasureHunterPlayer extends Model {
  
  static create(attributes) {
    const missingAttributes = this._requiredFields.filter((requiredField) => {
      return _.isNil(attributes) || _.isNil(attributes[requiredField]);
    });
    if (!_.isEmpty(missingAttributes)) {
      return Promise.reject(`TreasureHunterPlayer.create expects: ${missingAttributes.join(', ')}`);
    }

    // Try to find user, create if not found
    const treasureHunterPlayer = this._construct(attributes);
    return this.query().insert(treasureHunterPlayer).returning('*');
  }

  /*************************** Private Methods ***************************/

  static get _requiredFields() {
    return ['userId'];
  }

  static _construct(attributes) {
    const treasureHunterPlayer = new TreasureHunterPlayer();
    const writableFields = _.pull(this.fields, 'id');
    _.forEach(writableFields, (writableField) => {
      treasureHunterPlayer[writableField] = attributes[writableField];
    });
    return treasureHunterPlayer;
  }

  /*************************** Database Methods ****************************/

  static get tableName() {
    return 'treasureHunterPlayers';
  }

  static get fields() {
    return _.keys(this.jsonSchema.properties);
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'choice', 'gameId', 'outcome', 'userId'],
      properties: {
        id: {
          type: 'integer'
        },
        choice: {
          type: 'integer'
        },
        gameId: {
          type: 'integer'
        },
        outcome: {
          type: 'integer'
        },
        userId: {
          type: 'integer'
        }
      }
    };
  }

  static get relationMappings() {
    const TreasureHunterGame = require('./treasureHunterGame');
    const User = require('./user');
    return {
      players: {
        relation: Model.BelongsToOneRelation,
        modelClass: TreasureHunterGame,
        join: {
          from: 'treasureHunterPlayers.gameId',
          to: 'treasureHunterGames.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'treasureHunterPlayers.userId',
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = TreasureHunterPlayer;
