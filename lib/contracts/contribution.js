const Record = require('./record');
const ContributionSerializer = require('../serializers/contribution');

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

  async addContribution (contributionAttr, callOptions = {}) {
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

        return this.functions.add(...contribution, callOptions);
      });
  }
}

module.exports = Contribution;
