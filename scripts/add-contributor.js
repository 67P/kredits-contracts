const Registry = artifacts.require('./Registry.sol');
const Operator = artifacts.require('./Operator.sol');
const Contributors = artifacts.require('./Contributors.sol');

var bs58 = require('bs58');

function getBytes32FromMultiash(multihash) {
  const decoded = bs58.decode(multihash);

  return {
    digest: `0x${decoded.slice(2).toString('hex')}`,
    hashFunction: decoded[0],
    size: decoded[1],
  };
}

module.exports = function(callback) {
  Registry.deployed().then(async (registry) => {
    var operatorAddress = await registry.getProxyFor('Operator');
    var contributorsAddress = await registry.getProxyFor('Contributors');

    var operator = await Operator.at(operatorAddress);
    var contributors = await Contributors.at(contributorsAddress);

    let contributorToAddAddress = process.argv[4];
    if(!contributorToAddAddress) {
      console.log('please provide an address');
      proxess.exit();
    }
    let ipfsHash = process.argv[5] || 'QmQyZJT9uikzDYTZLhhyVZ5ReZVCoMucYzyvDokDJsijhj';
    let contributorMultihash = getBytes32FromMultiash(ipfsHash);
    let isCore = true;
    operator.addContributor(contributorToAddAddress, contributorMultihash.digest, contributorMultihash.hashFunction, contributorMultihash.size, isCore).then((result) => {
      console.log('Contributor added, tx: ', result.tx);
    });

    var contributorId = await contributors.getContributorIdByAddress(contributorToAddAddress);
    let proposalMultihash = getBytes32FromMultiash('QmQNA1hhVyL1Vm6HiRxXe9xmc6LUMBDyiNMVgsjThtyevs');
    operator.addProposal(contributorId, 23, proposalMultihash.digest, proposalMultihash.hashFunction, proposalMultihash.size).then((result) => {
      console.log('Proposal added, tx: ', result.tx);
    });

    var proposalId = await operator.proposalsCount();
    operator.vote(proposalId.toNumber()-1).then((result) => {
      console.log('Voted for proposal', proposalId, result.tx);
    })
  });
}
