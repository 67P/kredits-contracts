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
}

module.exports = Contribution;
