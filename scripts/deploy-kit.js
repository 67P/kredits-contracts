const deployDAOFactory = require('@aragon/os/scripts/deploy-daofactory.js')

const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv
const namehash = require('eth-ens-namehash').hash

const fileInject = require('./helpers/file_inject.js')
const getNetworkId = require('./helpers/networkid.js')

const DAOFactory = artifacts.require('DAOFactory')
const KreditsKit = artifacts.require('KreditsKit')

const arapp = require('../arapp.json')
const environment = argv['network'] || argv['environment'] || 'development'
const apm = arapp.environments[environment].apm
const ensAddr = arapp.environments[environment].registry || process.env.ENS
const daoFactoryAddress = arapp.environments[environment].daoFactory || process.env.DAO_FACTORY


module.exports = async function(callback) {
  const networkId = await getNetworkId(web3)
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
  let appIds = {}
  apps.sort().forEach((app) => {
    let [first, ...rest] = app;
    let contractName = `${first.toUpperCase()}${rest.join('')}`
    appIds[contractName] = namehash(`kredits-${app}.${apm}`)
  })

  KreditsKit.new(daoFactory.address, ensAddr, Object.values(appIds)).then((kreditsKit) => {
    console.log(`Deployed KreditsKit at: ${kreditsKit.address}`);

    fileInject(path.join(__dirname, '..', 'lib/addresses/KreditsKit.json'), networkId, kreditsKit.address);
    fileInject(path.join(__dirname, '..', 'lib/app_ids.json'), networkId, appIds);

    callback();
  }).catch((e) => {
    console.log(e);
    callback(e);
  })
}
