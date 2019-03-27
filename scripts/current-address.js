const knownDAOAddresses = require('../lib/addresses/dao.json');
const knownKreditsKitAddresses = require('../lib/addresses/KreditsKit.json');
const getNetworkId = require('./helpers/networkid.js')

module.exports = async function(callback) {
  const networkId = await getNetworkId(web3)

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
