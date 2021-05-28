import { BetterModel } from 'models/BetterModel.js';
import { User } from 'models/User.js';

class Deal extends BetterModel {
  buyerId!: string;
  item!: string;
  price!: number;
  quantity!: number;
  sellerId!: string;

  buyer?: User;
  seller?: User;

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        ...super.jsonSchema.required,
        'buyerId',
        'item',
        'price',
        'quantity',
        'sellerId',
      ],
      properties: {
        ...super.jsonSchema.properties,
        buyerId: {
          type: 'string',
        },
        item: {
          type: 'string',
        },
        price: {
          type: 'integer',
        },
        quantity: {
          type: 'integer',
        },
        sellerId: {
          type: 'string',
        },
      },
    };
  }

  static get relationMappings() {
    return () => ({
      buyer: {
        relation: BetterModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: `${this.tableName}.buyerId`,
          to: `${User.tableName}.chtwrsId`,
        },
      },
      seller: {
        relation: BetterModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: `${this.tableName}.sellerId`,
          to: `${User.tableName}.chtwrsId`,
        },
      },
    });
  }

  static get requiredFields() {
    return [
      ...super.requiredFields,
      'buyerId',
      'item',
      'price',
      'quantity',
      'sellerId',
    ];
  }

  static get tableName() {
    return 'deals';
  }
}

export { Deal };
