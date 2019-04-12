const Base = require('./base');
const ContributionSerializer = require('../serializers/contribution');
const paged = require('../utils/pagination');

class Proposal extends Base {
  all(options = {}) {
    return this.functions.proposalsCount()
      .then((count) => {
        let records = paged(count, options).map((id) => this.getById(id));
        return Promise.all(records);
      });
  }

  getById(id) {
    return this.functions.getProposal(id)
      .then(data => {
        return this.ipfs.catAndMerge(data, ContributionSerializer.deserialize);
      });
  }

  async addProposal(proposalAttr, callOptions = {}) {
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

module.exports = Proposal
