const fs = require('fs');
const getNetworkId = require('./networkid.js');

module.exports = async function(callback) {
  const daoAddressPath = 'lib/addresses/dao.json';

  // TODO maybe do the same for KreditsKit address file
  try {
    const networkId = await getNetworkId(web3);
    const daoAddresses = JSON.parse(fs.readFileSync(daoAddressPath));
    const oldNetworkId = Math.max(...Object.keys(daoAddresses).map(a => parseInt(a)));
    const localDaoAddress = daoAddresses[oldNetworkId];
    daoAddresses[networkId] = localDaoAddress;
    delete daoAddresses[oldNetworkId];
    fs.writeFileSync(daoAddressPath, JSON.stringify(daoAddresses, null, 2));
    console.log('Updated local network ID for DAO address');
  } catch(e) {
    console.log(e);
  }

  callback();
};
