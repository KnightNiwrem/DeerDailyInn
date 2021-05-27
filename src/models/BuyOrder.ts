import { BetterModel } from 'models/BetterModel';
import { User } from 'models/User';

class BuyOrder extends BetterModel {
  amountLeft!: number;
  item!: string;
  maxPrice!: number;
  quantity!: number;
  telegramId!: number;

  user?: User;

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        ...super.jsonSchema.required,
        'amountLeft',
        'item',
        'maxPrice',
        'quantity',
        'telegramId',
      ],
      properties: {
        ...super.jsonSchema.properties,
        amountLeft: {
          type: 'integer',
        },
        item: {
          type: 'string',
        },
        maxPrice: {
          type: 'integer',
        },
        quantity: {
          type: 'integer',
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
      'amountLeft',
      'item',
      'maxPrice',
      'quantity',
      'telegramId',
    ];
  }

  static get tableName() {
    return 'buyOrders';
  }
}

export { BuyOrder };
