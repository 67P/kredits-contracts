const ethers = require('ethers');

const schemas = require('kosmos-schemas');
const tv4 = require('tv4');
const validator = tv4.freshApi();

validator.addFormat({
  'date': function(value) {
    const dateRegexp = /^[0-9]{4,}-[0-9]{2}-[0-9]{2}$/;
    return dateRegexp.test(value) ? null : "A valid ISO 8601 full-date string is expected";
  },
  'time': function(value) {
    const timeRegexp = /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(([Zz])|([\+|\-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;
    return timeRegexp.test(value) ? null : "A valid ISO 8601 full-time string is expected";
  }
})

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
    let jsonStr = ContributionSerializer.serialize(contributionAttr);

    // Validate JSON document against schema
    let result = validator.validate(JSON.parse(jsonStr), schemas['contribution']);
    if (!result) { return Promise.reject(validator.error); }

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
