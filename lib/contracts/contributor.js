const ethers = require('ethers');
const RSVP = require('rsvp');

const ContributorSerializer = require('../serializers/contributor');
const Base = require('./base');

class Contributor extends Base {
  all() {
    return this.functions.contributorsCount()
      .then((count) => {
        count = count.toNumber();
        let contributors = [];

        for (let id = 1; id <= count; id++) {
          contributors.push(this.getById(id));
        }

        return RSVP.all(contributors);
      });
  }

  getById(id) {
    id = ethers.utils.bigNumberify(id);

    return this.functions.getContributorById(id)
      .then((data) => {
        // TODO: remove when naming updated on the contract
        data.hashDigest = data.ipfsHash;
        return data;
      })
      // Fetch IPFS data if available
      .then((data) => {
        return this.ipfs.catAndMerge(data, ContributorSerializer.deserialize);
      });
  }

  add(contributorAttr) {
    let json = ContributorSerializer.serialize(contributorAttr);
    // TODO: validate against schema

    return this.ipfs
      .add(json)
      .then((ipfsHashAttr) => {
        let contributor = [
          contributorAttr.account,
          ipfsHashAttr.hashDigest,
          ipfsHashAttr.hashFunction,
          ipfsHashAttr.hashSize,
          contributorAttr.isCore,
        ];

        console.log(contributor);
        return this.functions.addContributor(...contributor);
      });
  }
}

module.exports = Contributor;
