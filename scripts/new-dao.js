const fs = require('fs');
const path = require('path');

const fileInject = require('./helpers/file_inject.js');

const addressesPath = path.join(__dirname, '..', 'lib/addresses');

const KreditsKit = artifacts.require('KreditsKit')

module.exports = async function(callback) {
  // load networkId; will change with updated truffle
  const networkPromise = new Promise((resolve, reject) => {
    web3.version.getNetwork((err, network) => {
      if (err) {
        reject(err);
      } else {
        resolve(network);
      }
    })
  })
  const networkId = await networkPromise;
  console.log(`Deploying to networkId: ${networkId}`)

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

    fileInject(path.join(addressesPath, 'dao.json'), networkId, daoAddress)

    console.log(`\n\nCreated new DAO at: ${daoAddress}`)

    callback();
  }).catch((err) => {
    console.log('failed to create a new instance')
    callback(err)
  })
}
