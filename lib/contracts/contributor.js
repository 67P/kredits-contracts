const Record = require('./record');
const ContributorSerializer = require('../serializers/contributor');
const formatKredits = require('../utils/format-kredits');

class Contributor extends Record {
  get count () {
    return this.functions.contributorsCount();
  }

  getById(id) {
    return this.functions.getContributorById(id)
      .then(data => {
        data.balanceInt = formatKredits(data.balance);
        return this.ipfs.catAndMerge(data, ContributorSerializer.deserialize);
      })
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
