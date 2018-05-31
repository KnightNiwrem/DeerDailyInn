const { isEmpty, isNil, pull } = require('lodash');
const { Model } = require('objection');

class BaseModel extends Model {

  /*************************** Private Methods ***************************/

  static get _requiredFields() {
    return [];
  }

  static _construct(attributes) {
    const object = new this();
    const writableFields = pull(this.fields, 'id');
    _.forEach(writableFields, (writableField) => {
      deal[writableField] = attributes[writableField];
    });
    return deal;
  }

  /*************************** Database Methods ****************************/

  static get fields() {
    return _.keys(this.jsonSchema.properties);
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'integer'
        }
      }
    };
}

module.exports = BaseModel;