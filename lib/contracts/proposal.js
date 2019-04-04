const ethers = require('ethers');
const RSVP = require('rsvp');

const ContributionSerializer = require('../serializers/contribution');
const Base = require('./base');

class Proposal extends Base {
  all() {
    return this.functions.proposalsCount()
      .then(count => {
        let proposals = [];

        for (let id = 1; id <= count; id++) {
          proposals.push(this.getById(id));
        }

        return RSVP.all(proposals);
      });
  }

  getById(id) {
    return this.functions.getProposal(id)
      .then(data => {
        return this.ipfs.catAndMerge(data, ContributionSerializer.deserialize);
      });
  }

  addProposal(proposalAttr, callOptions = {}) {
    let json = ContributionSerializer.serialize(proposalAttr);
    // TODO: validate against schema

    return this.ipfs
      .add(json)
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

module.exports = Proposal
