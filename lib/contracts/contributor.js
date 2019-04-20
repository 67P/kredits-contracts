const Record = require('./record');
const ContributorSerializer = require('../serializers/contributor');

class Contributor extends Record {
  get count () {
    return this.functions.contributorsCount();
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

  async add(contributorAttr, callOptions = {}) {
    let contributor = new ContributorSerializer(contributorAttr);

    try { await contributor.validate(); }
    catch (error) { return Promise.reject(error); }

    const jsonStr = contributor.serialize();

    return this.ipfs
      .add(jsonStr)
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
