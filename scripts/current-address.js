const knownDAOAddresses = require('../lib/addresses/dao.json');
const knownKreditsKitAddresses = require('../lib/addresses/KreditsKit.json');
const getNetworkId = require('./helpers/networkid.js')
const ethers = require('ethers');

module.exports = async function(callback) {
  const provider = new ethers.providers.Web3Provider(web3.currentProvider);
  let network = await provider.getNetwork();
  let networkId = network.chainId;

  console.log('# All known DAO addresses');
  Object.keys(knownDAOAddresses).forEach((networkId) => {
    console.log(`  Network ID: ${networkId} => ${knownDAOAddresses[networkId]}`);
  });
  console.log('# All known KreditsKit addresses');
  Object.keys(knownKreditsKitAddresses).forEach((networkId) => {
    console.log(`  Network ID: ${networkId} => ${knownKreditsKitAddresses[networkId]}`);
  });
  console.log('-----------------');

  console.log(`# Current network ID: ${networkId}`);

  let currentDAOAddress = knownDAOAddresses[networkId];
  let currentKreditsKitAddress = knownKreditsKitAddresses[networkId];

  console.log(`# Current KreditsKit address: ${currentKreditsKitAddress}`);
  console.log(`# Current DAO address: ${currentDAOAddress}`);

  callback();
};
