import { BetterModel } from 'models/BetterModel.js';
import { Deal } from 'models/Deal.js';
import { Subscription } from 'models/Subscription.js';

class User extends BetterModel {
  balance!: number;
  buyOrderLimit!: number;
  canNotify!: boolean;
  chtwrsId?: string;
  chtwrsToken?: string;
  telegramId!: number;

  purchases?: Deal[];
  sales?: Deal[];
  subscriptions?: Subscription[];

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        ...super.jsonSchema.required,
        'telegramId',
      ],
      properties: {
        ...super.jsonSchema.properties,
        balance: {
          type: 'integer',
          default: 0,
        },
        buyOrderLimit: {
          type: 'integer',
          default: 5,
        },
        canNotify: {
          type: 'boolean',
        },
        chtwrsId: {
          type: ['string', 'null'],
        },
        chtwrsToken: {
          type: ['string', 'null'],
        },
        telegramId: {
          type: 'integer',
        },
      },
    };
  }

  static get relationMappings() {
    return () => ({
      purchases: {
        relation: BetterModel.HasManyRelation,
        modelClass: Deal,
        join: {
          from: `${this.tableName}.chtwrsId`,
          to: `${Deal.tableName}.buyerId`,
        },
      },
      sales: {
        relation: BetterModel.HasManyRelation,
        modelClass: Deal,
        join: {
          from: `${this.tableName}.chtwrsId`,
          to: `${Deal.tableName}.sellerId`,
        },
      },
      subscriptions: {
        relation: BetterModel.HasManyRelation,
        modelClass: Subscription,
        join: {
          from: `${this.tableName}.id`,
          to: `${Subscription.tableName}.userId`,
        },
      },
    });
  }

  static get requiredFields() {
    return [
      ...super.requiredFields,
      'telegramId',
    ];
  }

  static get tableName() {
    return 'users';
  }
}

export { User };
