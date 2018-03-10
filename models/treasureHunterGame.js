const _ = require('lodash');
const Promise = require('bluebird');
const { Model } = require('objection');

class TreasureHunterGame extends Model {
  
  static create(attributes) {
    const missingAttributes = this._requiredFields.filter((requiredField) => {
      return _.isNil(attributes) || _.isNil(attributes[requiredField]);
    });
    if (!_.isEmpty(missingAttributes)) {
      return Promise.reject(`TreasureHunterGame.create expects: ${missingAttributes.join(', ')}`);
    }

    // Try to find user, create if not found
    const treasureHunterGame = this._construct(attributes);
    return this.query().insert(treasureHunterGame).returning('*');
  }

  /*************************** Private Methods ***************************/

  static get _requiredFields() {
    return ['chatId', 'status'];
  }

  static _construct(attributes) {
    const treasureHunterGame = new TreasureHunterGame();
    const writableFields = _.pull(this.fields, 'id');
    _.forEach(writableFields, (writableField) => {
      treasureHunterGame[writableField] = attributes[writableField];
    });
    return treasureHunterGame;
  }

  /*************************** Database Methods ****************************/

  static get tableName() {
    return 'treasureHunterGames';
  }

  static get fields() {
    return _.keys(this.jsonSchema.properties);
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'chatId', 'status'],
      properties: {
        id: {
          type: 'integer'
        },
        chatId: {
          type: 'integer'
        },
        status: {
          type: 'string',
          enum: ['cancelled', 'completed', 'pending', 'started']
        }
      }
    };
  }

  static get relationMappings() {
    const TreasureHunterPlayer = require('./treasureHunterPlayer');
    return {
      players: {
        relation: Model.HasManyRelation,
        modelClass: TreasureHunterPlayer,
        join: {
          from: 'treasureHunterGames.id',
          to: 'treasureHunterPlayers.gameId'
        }
      }
    };
  }
}

module.exports = TreasureHunterGame;
