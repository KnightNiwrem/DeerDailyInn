import { BetterModel } from 'models/BetterModel';
import { User } from 'models/User';

class FriendCode extends BetterModel {
  friendCode!: string;
  telegramId!: number;

  user?: User;

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        ...super.jsonSchema.required,
        'telegramId',
        'friendCode',
      ],
      properties: {
        ...super.jsonSchema.properties,
        friendCode: {
          type: 'string',
        },
        telegramId: {
          type: 'integer',
        },
      },
    };
  }

  static get relationMappings() {
    return () => ({
      user: {
        relation: BetterModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: `${this.tableName}.telegramId`,
          to: `${User.tableName}.telegramId`,
        },
      },
    });
  }

  static get requiredFields() {
    return [
      ...super.requiredFields,
      'friendCode',
      'telegramId',
    ];
  }

  static get tableName() {
    return 'friendCodes';
  }
}

export { FriendCode };
