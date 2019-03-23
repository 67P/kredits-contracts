const ethers = require('ethers');
const RSVP = require('rsvp');

const ContributionSerializer = require('../serializers/contribution');
const Base = require('./base');

class Contribution extends Base {
  all() {
    return this.functions.contributionsCount()
      .then((count) => {
        count = count.toNumber();
        let contributions = [];

        for (let id = 1; id <= count; id++) {
          contributions.push(this.getById(id));
        }

        return RSVP.all(contributions);
      });
  }

  getById(id) {
    id = ethers.utils.bigNumberify(id);

    return this.functions.getContribution(id)
      .then((data) => {
        return this.ipfs.catAndMerge(data, ContributionSerializer.deserialize);
      });

  }

  getByContributor(contributor) {
    return this.functions.balanceOf(contributor)
      then((balance) => {
        count = balance.toNumber();

        let contributions = [];

        for (let index = 0; index <= count; index++) {
          this.functions.tokenOfOwnerByIndex(contributor, index)
            .then((id) => {
              contributions.push(this.getById(id));
            });
        }

        return RSVP.all(contributions);
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
          contributionAttr.contributorAccount,
          ipfsHashAttr.hashDigest,
          ipfsHashAttr.hashFunction,
          ipfsHashAttr.hashSize,
        ];

        console.log(contribution);
        return this.functions.add(...contribution, callOptions);
      });
  }
}

module.exports = Contribution;