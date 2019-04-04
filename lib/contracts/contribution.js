const ethers = require('ethers');

const ContributionSerializer = require('../serializers/contribution');
const Base = require('./base');

class Contribution extends Base {
  all() {
    return this.functions.contributionsCount()
      .then(async (count) => {
        let contributions = [];

        for (let id = 1; id <= count; id++) {
          const contribution = await this.getById(id)
          contributions.push(contribution);
        }

        return contributions;
      });
  }

  getById(id) {
    return this.functions.getContribution(id)
      .then(data => {
        return this.ipfs.catAndMerge(data, ContributionSerializer.deserialize);
      });

  }

  getByContributorId(contributorId) {
    return this.functions.getContributorAddressById(contributorId)
      .then(address => this.getByContributorAddress(address));
  }

  getByContributorAddress(address) {
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

  addContribution(contributionAttr, callOptions = {}) {
    let json = ContributionSerializer.serialize(contributionAttr);
    // TODO: validate against schema

    return this.ipfs
      .add(json)
      .then((ipfsHashAttr) => {
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
