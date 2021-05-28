import { BetterModel } from 'models/BetterModel.js';
import { User } from 'models/User.js';

class Subscription extends BetterModel {
  expirationDate!: string;
  isActive!: boolean;
  paymentInfo!: string;
  telegramId!: number;

  user?: User;

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        ...super.jsonSchema.required,
        'expirationDate',
        'telegramId',
      ],
      properties: {
        ...super.jsonSchema.properties,
        expirationDate: {
          type: 'string',
          format: 'date-time',
        },
        isActive: {
          type: 'boolean',
          default: false,
        },
        paymentInfo: {
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
          from: `${this.tableName}.userId`,
          to: `${User.tableName}.id`,
        },
      },
    });
  }

  static get requiredFields() {
    return [
      ...super.requiredFields,
      'expirationDate',
      'telegramId',
    ];
  }

  static get tableName() {
    return 'subscriptions';
  }
}

export { Subscription };
