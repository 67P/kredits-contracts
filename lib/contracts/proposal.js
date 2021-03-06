const Record = require('./record');
const ContributionSerializer = require('../serializers/contribution');
const deprecate = require('../utils/deprecate');

class Proposal extends Record {
  get count () {
    return this.contract.proposalsCount();
  }

  getById (id) {
    return this.contract.getProposal(id)
      .then(data => {
        return this.ipfs.catAndMerge(data, ContributionSerializer.deserialize);
      });
  }

  async add (proposalAttr, callOptions = {}) {
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

        return this.contract.addProposal(...proposal, callOptions);
      });
  }

  addProposal () {
    deprecate('The function `addProposal()` is deprecated and will be removed in the next major version. Use `add()` instead');
    return this.add(...arguments);
  }
}

module.exports = Proposal;
