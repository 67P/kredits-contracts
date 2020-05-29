let schemas = require('@kosmos/schemas');
schemas['expense'] = require('@kosmos/schemas/schemas/expense.json');
const validator = require('../utils/validator');

/**
 * Serialization and validation for JSON-LD document of the Expense
 *
 * @class
 * @public
 */
class Expense {

  constructor (attrs) {
    Object.keys(attrs).forEach(a => this[a] = attrs[a]);
  }

  /**
   * Serialize object to JSON
   *
   * @public
   */
  serialize () {
    let {
      title,
      description,
      currency,
      amount,
      date,
      url,
      tags,
      details,
    } = this;

    let data = {
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

    // Write it pretty to ipfs
    return JSON.stringify(data, null, 2);
  }

  /**
   * Validate serialized data against schema
   *
   * @public
   */
  validate () {
    const serialized = JSON.parse(this.serialize());
    console.log(schemas['expense']);
    const valid = validator.validate(serialized, schemas['expense']);
    return valid ? Promise.resolve() : Promise.reject(validator.error);
  }

  /**
   * Deserialize JSON to object
   *
   * @public
   */
  static deserialize (serialized) {
    let {
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

module.exports = Expense;
