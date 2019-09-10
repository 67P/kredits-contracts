const Record = require('./record');
const ContributionSerializer = require('../serializers/contribution');
const deprecate = require('../utils/deprecate');

class Contribution extends Record {
  get count () {
    return this.functions.contributionsCount();
  }

  getById (id) {
    return this.functions.getContribution(id)
      .then(data => {
        return this.ipfs.catAndMerge(data, ContributionSerializer.deserialize);
      });
  }

  getData (id) {
    return this.functions.getContribution(id);
  }

  getByContributorId (contributorId) {
    return this.functions.getContributorAddressById(contributorId)
      .then(address => this.getByContributorAddress(address));
  }

  getByContributorAddress (address) {
    return this.functions.balanceOf(address)
      .then(async (balance) => {
        const count = balance.toNumber();
        const contributions = [];

        for (let index = 0; index < count; index++) {
          const id = await this.functions.tokenOfOwnerByIndex(address, index);
          const contribution = await this.getById(id);
          contributions.push(contribution);
        }

        return contributions;
      });
  }

  async add (contributionAttr, callOptions = {}) {
    const contribution = new ContributionSerializer(contributionAttr);

    try { await contribution.validate(); }
    catch (error) { return Promise.reject(error); }

    const jsonStr = contribution.serialize();

    return this.ipfs
      .add(jsonStr)
      .then(ipfsHashAttr => {
        let contribution = [
          contributionAttr.amount,
          contributionAttr.contributorId,
          ipfsHashAttr.hashDigest,
          ipfsHashAttr.hashFunction,
          ipfsHashAttr.hashSize,
        ];

        return this.functions.add(...contribution, callOptions).then(res => {
          res.ipfsHash = this.ipfs.encodeHash(ipfsHashAttr);
          return res;
        });
      });
  }

  addContribution () {
    deprecate('The function `addContribution()` is deprecated and will be removed in the next major version. Use `add()` instead');
    return this.add(...arguments);
  }

}

module.exports = Contribution;
