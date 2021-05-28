import { BetterModel } from 'models/BetterModel.js';
import { User } from 'models/User.js';

class Transaction extends BetterModel {
  apiStatus!: string;
  fromId!: number;
  quantity!: number;
  reason!: string;
  status!: string;
  toId!: number;

  source?: User;
  destination?: User;

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        ...super.jsonSchema.required,
        'fromId',
        'quantity',
        'reason',
        'status',
        'toId',
      ],
      properties: {
        ...super.jsonSchema.properties,
        apiStatus: {
          type: 'string',
        },
        fromId: {
          type: 'integer',
          default: 0,
        },
        quantity: {
          type: 'integer',
        },
        reason: {
          type: 'string',
        },
        status: {
          type: 'string',
          enum: ['cancelled', 'completed', 'pending', 'started'],
        },
        toId: {
          type: 'integer',
          default: 0,
        },
      },
    };
  }

  static get relationMappings() {
    return () => ({
      source: {
        relation: BetterModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: `${this.tableName}.fromId`,
          to: `${User.tableName}.id`,
        },
      },
      destination: {
        relation: BetterModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: `${this.tableName}.toId`,
          to: `${User.tableName}.id`,
        },
      },
    });
  }

  static get requiredFields() {
    return [
      ...super.requiredFields,
      'fromId',
      'quantity',
      'reason',
      'status',
      'toId',
    ];
  }

  static get tableName() {
    return 'transactions';
  }
}

export { Transaction };
