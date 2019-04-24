const schemas = require('kosmos-schemas');
const validator = require('../utils/validator');
/**
 * Handle serialization for JSON-LD object of the contributor, according to
 * https://github.com/67P/kosmos-schemas/blob/master/schemas/contributor.json
 *
 * @class
 * @public
 */
class Contributor {

  constructor (attrs) {
    Object.keys(attrs).forEach(a => this[a] = attrs[a]);
  }

 /**
  * Serialize object to JSON
  *
  * @method
  * @public
  */
  serialize () {
    let {
      name,
      kind,
      url,
      github_uid,
      github_username,
      gitea_username,
      wiki_username,
    } = this;

    let data = {
      "@context": "https://schema.kosmos.org",
      "@type": "Contributor",
      kind,
      name,
      "accounts": [],
    };

    if (url) {
      data["url"] = url;
    }

    if (github_uid) {
      data.accounts.push({
        "site": "github.com",
        "uid": github_uid,
        "username": github_username,
        "url": `https://github.com/${github_username}`,
      });
    }

    if (gitea_username) {
      data.accounts.push({
        "site": "gitea.kosmos.org",
        "username": gitea_username,
        "url": `https://gitea.kosmos.org/${gitea_username}`
      });
    }

    if (wiki_username) {
      data.accounts.push({
        "site": "wiki.kosmos.org",
        "username": wiki_username,
        "url": `https://wiki.kosmos.org/User:${wiki_username}`,
      });
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
    const valid = validator.validate(serialized, schemas['contributor']);
    return valid ? Promise.resolve() : Promise.reject(validator.error);
  }

  /**
  * Deserialize JSON to object
  *
  * @method
  * @public
  */
  static deserialize (serialized) {
    let {
      name,
      kind,
      url,
      accounts,
    } = JSON.parse(serialized.toString('utf8'));

    let github_username, github_uid, gitea_username, wiki_username;
    let github = accounts.find(a => a.site === 'github.com');
    let gitea  = accounts.find(a => a.site === 'gitea.kosmos.org');
    let wiki   = accounts.find(a => a.site === 'wiki.kosmos.org');

    if (github) {
      (({ username: github_username, uid: github_uid} = github));
    }
    if (gitea) {
      (({ username: gitea_username } = gitea));
    }
    if (wiki) {
      (({ username: wiki_username } = wiki));
    }

    return {
      name,
      kind,
      url,
      accounts,
      github_uid,
      github_username,
      gitea_username,
      wiki_username,
      ipfsData: serialized,
    };
  }

}

module.exports = Contributor;
