import { BetterModel } from 'models/BetterModel';
import { User } from 'models/User';

class Status extends BetterModel {
  deltaBuyOrderLimit!: number;
  deltaCoffeePrice!: number;
  description!: string;
  expireAt!: string;
  startAt!: string;
  telegramId!: number;
  title!: string;

  user?: User;

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        ...super.jsonSchema.required,
        'expireAt',
        'startAt',
        'telegramId'
      ],
      properties: {
        ...super.jsonSchema.properties,
        deltaBuyOrderLimit: {
          type: 'integer',
        },
        deltaCoffeePrice: {
          type: 'integer',
        },
        description: {
          type: 'string',
        },
        expireAt: {
          type: 'string',
          format: 'date-time',
        },
        startAt: {
          type: 'string',
          format: 'date-time',
        },
        telegramId: {
          type: 'integer',
        },
        title: {
          type: 'string',
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
      'description',
      'expireAt',
      'startAt',
      'telegramId',
      'title',
    ];
  }

  static get tableName() {
    return 'statuses';
  }
}

export { Status };
