const RSVP = require('rsvp');

const ContributorSerializer = require('../serializers/contributor');
const Base = require('./base');

class Contributor extends Base {
  all() {
    return this.functions.contributorsCount()
      .then(count => {
        let contributors = [];

        for (let id = 1; id <= count; id++) {
          contributors.push(this.getById(id));
        }

        return RSVP.all(contributors);
      });
  }

  getById(id) {
    return this.functions.getContributorById(id)
      .then((data) => {
        return this.ipfs.catAndMerge(data, ContributorSerializer.deserialize);
      });
  }

  filterByAccount(search) {
    return this._byAccount(search, 'filter');
  }

  findByAccount(search) {
    return this._byAccount(search, 'find');
  }

  _byAccount(search, method = 'filter') {
    return this.all().then((contributors) => {
      const searchEntries = Object.entries(search);

      return contributors[method]((contributor) => {
        if (!contributor.accounts) { return false; }
        return contributor.accounts.find((account) => {
          return searchEntries.every((item) => {
            let [ key, value ] = item;
            return account[key] === value;
          });
        });
      });
    });
  }

  add(contributorAttr, callOptions = {}) {
    let json = ContributorSerializer.serialize(contributorAttr);
    // TODO: validate against schema

    return this.ipfs
      .add(json)
      .then((ipfsHashAttr) => {
        let contributor = [
          contributorAttr.account,
          ipfsHashAttr.hashDigest,
          ipfsHashAttr.hashFunction,
          ipfsHashAttr.hashSize,
        ];

        return this.functions.addContributor(...contributor, callOptions);
      });
  }
}

module.exports = Contributor;
