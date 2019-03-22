const deployDAOFactory = require('@aragon/os/scripts/deploy-daofactory.js')
const KreditsKit = artifacts.require('KreditsKit')

const fs = require('fs');
const path = require('path');
const libPath = path.join(__dirname, '..', 'lib');
const addressesPath = path.join(libPath, 'addresses');

const ensAddr = process.env.ENS

module.exports = async (callback) => {
  if (!ensAddr) {
    callback(new Error("ENS address not found in environment variable ENS"))
  }

  deployDAOFactory(null, { artifacts, verbose: false })
    .catch(console.log)
    .then((result) => {
      const daoFactory = result.daoFactory

      KreditsKit.new(daoFactory.address, ensAddr)
        .catch(console.log)
        .then((kreditsKit) => {
          console.log(kreditsKit.address)

          kreditsKit.newInstance().then((ret) => {
          console.log(ret.logs);
          const installedEvents = ret.logs.filter(log => log.event === 'InstalledApp').map(log => log.args)
          const deployEvents = ret.logs.filter(log => log.event === 'DeployInstance').map(log => log.args)

          if (deployEvents.length > 1) {
            callback(new Error("More than one DAO was deployed. Something is wrong"))
          }
          const daoAddress = deployEvents[0].dao;
          const networkId = parseInt(web3.version.network);

          let addresseFile = path.join(addressesPath, `dao.json`);
          let addresses = JSON.parse(fs.readFileSync(addresseFile));

          addresses[networkId] = daoAddress;
          fs.writeFileSync(addresseFile, JSON.stringify(addresses));

          callback();
        }).catch((e) => {
          console.log(e);
        })
      })
    })
}
