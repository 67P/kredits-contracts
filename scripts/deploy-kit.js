const deployDAOFactory = require('@aragon/os/scripts/deploy-daofactory.js')

const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv
const namehash = require('eth-ens-namehash').hash

const libPath = path.join(__dirname, '..', 'lib');
const addressesPath = path.join(libPath, 'addresses');

const DAOFactory = artifacts.require('DAOFactory')
const KreditsKit = artifacts.require('KreditsKit')

const arapp = require('../arapp.json')
const environment = argv['network'] || argv['environment'] || 'development'
const apm = arapp.environments[environment].apm
const ensAddr = arapp.environments[environment].registry || process.env.ENS
const daoFactoryAddress = arapp.environments[environment].daoFactory || process.env.DAO_FACTORY


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

  if (!ensAddr) {
    callback(new Error("ENS address not found in environment variable ENS"))
  }
  console.log(`Using ENS at: ${ensAddr}`);

  let daoFactory
  if (daoFactoryAddress) {
    daoFactory = DAOFactory.at(daoFactoryAddress)
  } else {
    daoFactory = (await deployDAOFactory(null, { artifacts, verbose: false })).daoFactory
  }
  console.log(`Using DAOFactory at: ${daoFactory.address}`)

  const apps = fs.readdirSync('./apps')
  console.log(`Found apps: [${apps}].${apm}`)
  const appIds = apps.map(app => namehash(`kredits-${app}.${apm}`))

  KreditsKit.new(daoFactory.address, ensAddr, appIds).then((kreditsKit) => {
    console.log(`Deployed KreditsKit at: ${kreditsKit.address}`);

    let addresseFile = path.join(addressesPath, `KreditsKit.json`);
    let addresses = JSON.parse(fs.readFileSync(addresseFile));

    addresses[networkId] = kreditsKit.address;
    fs.writeFileSync(addresseFile, JSON.stringify(addresses));

    callback();
  }).catch((e) => {
    console.log(e);
    callback(e);
  })
}
