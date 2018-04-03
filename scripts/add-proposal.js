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

    let recipientAddress = process.argv[4];
    if(!recipientAddress) {
      console.log('please provide an address');
      process.exit();
    }
    let ipfsHash = process.argv[5] || 'QmQNA1hhVyL1Vm6HiRxXe9xmc6LUMBDyiNMVgsjThtyevs';
    let multihash = getBytes32FromMultiash(ipfsHash);

    let contributorId = await contributors.getContributorIdByAddress(recipientAddress);

    operator.addProposal(contributorId.toNumber(), 23, multihash.digest, multihash.hashFunction, multihash.size).then((result) => {
      console.log('Proposal added, tx: ', result.tx);
    });

  });
}
