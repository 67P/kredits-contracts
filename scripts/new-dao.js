const fs = require('fs');
const path = require('path');
const libPath = path.join(__dirname, '..', 'lib');
const addressesPath = path.join(libPath, 'addresses');

const KreditsKit = artifacts.require('KreditsKit')

module.exports = async function(callback) {
  const networkId = parseInt(web3.version.network);

  let kitAddresseFile = path.join(addressesPath, 'KreditsKit.json');
  let kitAddresses = JSON.parse(fs.readFileSync(kitAddresseFile));
  let kreditsKitAddress = process.env.KREDITS_KIT || kitAddresses[networkId]
  if (!kreditsKitAddress) {
    callback(new Error("KreditsKit address not found in environment variable KREDITS_KIT"))
  }
  console.log(`Using KreditsKit at: ${kreditsKitAddress}`);

  let kreditsKit = KreditsKit.at(kreditsKitAddress)

  kreditsKit.newInstance().then((ret) => {
    console.log(ret.logs);
    const installedEvents = ret.logs.filter(log => log.event === 'InstalledApp').map(log => log.args)
    const deployEvents = ret.logs.filter(log => log.event === 'DeployInstance').map(log => log.args)

    if (deployEvents.length > 1) {
      callback(new Error("More than one DAO was deployed. Something is wrong"))
    }
    const daoAddress = deployEvents[0].dao;

    let addresseFile = path.join(addressesPath, `dao.json`);
    let addresses = JSON.parse(fs.readFileSync(addresseFile));

    addresses[networkId] = daoAddress;
    fs.writeFileSync(addresseFile, JSON.stringify(addresses));

    console.log(`\n\nCreated new DAO at: ${daoAddress}`)

    callback();
  }).catch((err) => {
    console.log('failed to create a new instance')
    callback(err)
  })
}
