const Registry = artifacts.require('./Registry.sol');
const Operator = artifacts.require('./Operator.sol');
const Contributors = artifacts.require('./Contributors.sol');
const promptly = require('promptly');

const bs58 = require('bs58');

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

    let contributorToAddAddress = await promptly.prompt('Contributor address: ');
    let ipfsHash = await promptly.prompt('IPFS hash (blank for default): ', { default: 'QmQNA1hhVyL1Vm6HiRxXe9xmc6LUMBDyiNMVgsjThtyevs' });

    let contributorMultihash = getBytes32FromMultiash(ipfsHash);
    let isCore = true;
    let contributorResult = await contributors.addContributor(contributorToAddAddress, contributorMultihash.digest, contributorMultihash.hashFunction, contributorMultihash.size, isCore);
    console.log('Contributor added, tx: ', contributorResult.tx);

    let contributorId = await contributors.getContributorIdByAddress(contributorToAddAddress);
    let proposalMultihash = getBytes32FromMultiash('QmQNA1hhVyL1Vm6HiRxXe9xmc6LUMBDyiNMVgsjThtyevs');
    let proposalResult = await operator.addProposal(contributorId, 23, proposalMultihash.digest, proposalMultihash.hashFunction, proposalMultihash.size);
    console.log('Proposal added, tx: ', proposalResult.tx);

    let proposalId = await operator.proposalsCount();
    let votingResult = await operator.vote(proposalId.toNumber()-1);
    console.log('Voted for proposal', proposalId.toString(), votingResult.tx);

    callback();
  });
}
