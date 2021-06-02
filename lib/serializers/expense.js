const schemas = require('@kosmos/schemas');
const validator = require('../utils/validator');

/**
 * Serialization and validation for JSON-LD document of the Expense
 *
 * @class
 * @public
 */
class ExpenseSerializer {

  constructor (attrs) {
    Object.keys(attrs).forEach(a => this[a] = attrs[a]);
  }

  /**
   * Serialize object to JSON
   *
   * @public
   */
  serialize () {
    // Write it pretty to ipfs
    return JSON.stringify(this.data, null, 2);
  }

  get data () {
    const {
      title,
      description,
      currency,
      amount,
      date,
      url,
      tags,
      details,
    } = this;

    const data = {
      '@context': 'https://schema.kosmos.org',
      '@type': 'Expense',
      title,
      description,
      currency,
      amount,
      date,
      'tags': tags || [],
      'details': details || {},
    };

    if (url) {
      data['url'] = url;
    }

    return data;
  }

  /**
   * Validate serialized data against schema
   *
   * @public
   */
  validate () {
    const serialized = JSON.parse(this.serialize());
    const valid = validator.validate(serialized, schemas['expense']);
    return valid ? Promise.resolve() : Promise.reject(validator.error);
  }

  /**
   * Deserialize JSON to object
   *
   * @public
   */
  static deserialize (serialized) {
    const {
      title,
      description,
      currency,
      amount,
      date,
      url,
      tags,
      details,
    } = JSON.parse(serialized.toString('utf8'));

    return {
      title,
      description,
      currency,
      amount,
      date,
      url,
      tags,
      details,
      ipfsData: serialized,
    };
  }

}

module.exports = ExpenseSerializer;
