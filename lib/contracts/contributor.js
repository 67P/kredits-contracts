const Base = require('./base');
const ContributorSerializer = require('../serializers/contributor');
const paged = require('../utils/pagination');

class Contributor extends Base {
  all(options = {}) {
    return this.functions.contributorsCount()
      .then((count) => {
        let records = paged(count, options).map((id) => this.getById(id));
        return Promise.all(records);
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
