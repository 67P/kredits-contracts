const RSVP = require('rsvp');

const ContributionSerializer = require('../serializers/contribution');
const Base = require('./base');

class Proposal extends Base {
  all () {
    return this.functions.proposalsCount()
      .then(count => {
        let proposals = [];

        for (let id = 1; id <= count; id++) {
          proposals.push(this.getById(id));
        }

        return RSVP.all(proposals);
      });
  }

  getById (id) {
    return this.functions.getProposal(id)
      .then(data => {
        return this.ipfs.catAndMerge(data, ContributionSerializer.deserialize);
      });
  }

  async addProposal (proposalAttr, callOptions = {}) {
    const contribution = new ContributionSerializer(proposalAttr);

    try { await contribution.validate(); }
    catch (error) { return Promise.reject(error); }

    const jsonStr = contribution.serialize();

    return this.ipfs
      .add(jsonStr)
      .then((ipfsHashAttr) => {
        let proposal = [
          proposalAttr.contributorId,
          proposalAttr.amount,
          ipfsHashAttr.hashDigest,
          ipfsHashAttr.hashFunction,
          ipfsHashAttr.hashSize,
        ];

        return this.functions.addProposal(...proposal, callOptions);
      });
  }
}

module.exports = Proposal;
