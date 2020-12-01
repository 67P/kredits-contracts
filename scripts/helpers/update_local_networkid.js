const fs = require('fs');
const ethers = require('ethers');

module.exports = async function(callback) {
  const daoAddressPath = 'lib/addresses/dao.json';

  // TODO maybe do the same for KreditsKit address file
  try {
    const provider = new ethers.providers.Web3Provider(web3.currentProvider);
    const network = await provider.getNetwork();
    const networkId = network.chainId;
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
