const knownAddresses = require('../lib/addresses/dao.json');

module.exports = function(callback) {

  console.log('# All known addresses');
  Object.keys(knownAddresses).forEach((networkId) => {
    console.log(`  Network ID: ${networkId} => ${knownAddresses[networkId]}`);
  })

  const networkId = web3.version.network;
  console.log(`# Current network ID: ${networkId}`);

  let currentAddress = knownAddresses[networkId];

  if (currentAddress) {
    console.log(`# Current address: ${currentAddress}`);
  } else {
    console.log(`No deployment found for network ID ${networkId}`);
  }

  callback();
};
