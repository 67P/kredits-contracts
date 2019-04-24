const schemas = require('kosmos-schemas');
const validator = require('../utils/validator');

/**
 * Serialization and validation for JSON-LD document of the contribution.
 *
 * @class
 * @public
 */
class Contribution {

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
      contributorIpfsHash,
      date,
      time,
      kind,
      description,
      url,
      details,
    } = this;

    let data = {
      '@context': 'https://schema.kosmos.org',
      '@type': 'Contribution',
      'contributor': {
        'ipfs': contributorIpfsHash,
      },
      date,
      time,
      kind,
      description,
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
    const valid = validator.validate(serialized, schemas['contribution']);
    return valid ? Promise.resolve() : Promise.reject(validator.error);
  }

  /**
   * Deserialize JSON to object
   *
   * @public
   */
  static deserialize (serialized) {
    let {
      date,
      time,
      kind,
      description,
      details,
      url,
    } = JSON.parse(serialized.toString('utf8'));

    return {
      date,
      time,
      kind,
      description,
      details,
      url,
      ipfsData: serialized,
    };
  }

}

module.exports = Contribution;
