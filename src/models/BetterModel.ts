import {
  filter,
  flatten,
  fromPairs,
  isArray,
  isEmpty,
  isNil,
  keys,
  map,
  some,
} from 'lodash';
import { Model, ValidationError } from 'objection';
import type { QueryBuilder, QueryContext } from 'objection';

class BetterModel extends Model {
  id!: number;
  created_at!: string;
  updated_at!: string;

  static get fields() {
    return keys(this.jsonSchema.properties);
  }

  static get jsonSchema(): any {
    return {
      type: 'object',
      required: [],
      properties: {
        id: { type: 'string' },
        created_at: { format: 'date-time', type: 'string' },
        updated_at: { format: 'date-time', type: 'string' },
      },
    };
  }

  static get protectedFields() {
    return ['id', 'created_at', 'updated_at'];
  }

  static get relationMappings() {
    return () => ({});
  }

  static get requiredFields(): (string | string[])[] {
    return [];
  }

  static get tableName() {
    return this.name;
  }

  static async create<T extends typeof BetterModel>(this: T, props: any) {
    type R = QueryBuilder<InstanceType<T>, InstanceType<T> | undefined>;
    return this.query().insert(props).returning('*') as R;
  }

  async $beforeInsert(queryContext: QueryContext) {
    await super.$beforeInsert(queryContext);

    const missingRequirements = this.getMissingFields();
    if (!isEmpty(missingRequirements)) {
      const validationError = this.buildMissingFieldsError(missingRequirements);
      throw validationError;
    }

    this.created_at = new Date().toISOString();
  }

  async $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  protected buildMissingFieldsError<T extends typeof BetterModel>(
    this: InstanceType<T>,
    missingFields: (string | string[])[],
  ) {
    const thisClass = this.constructor as T;
    const className = thisClass.name;
    const dataEntries = map(missingFields, requirement => {
      const requirementString = JSON.stringify(requirement);
      return [
        requirementString,
        {
          keyword: 'required',
          message: `${className} insert expects ${isArray(requirement)
            ? `one of ${requirementString}`
            : requirementString
          }`,
          params: null,
        },
      ];
    });

    return new ValidationError({
      message: `${className} insert expects ${JSON.stringify(thisClass.requiredFields)}`,
      type: 'ModelValidation',
      data: fromPairs(dataEntries),
    });
  }

  protected getMissingFields<T extends typeof BetterModel>(
    this: InstanceType<T>,
  ) {
    const thisClass = this.constructor as T;
    const missingFields = filter(thisClass.requiredFields, requirement => {
      const fields = flatten([requirement]) as (keyof InstanceType<T>)[];
      return !some(fields, field => !isNil(this[field]));
    });
    return missingFields;
  }
}

export { BetterModel };
