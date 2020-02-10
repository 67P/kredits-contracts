const deployDAOFactory = require('@aragon/os/scripts/deploy-daofactory.js')

const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv
const namehash = require('ethers').utils.namehash;

const fileInject = require('./helpers/file_inject.js')
const getNetworkId = require('./helpers/networkid.js')

const DAOFactory = artifacts.require('DAOFactory')
const KreditsKit = artifacts.require('KreditsKit')

const arapp = require('../arapp.json')
const environment = argv['network'] || argv['environment'] || 'development'

const kreditsArappConfig = (arapp.environments[environment].kredits || {}

// typically we use the open.aragonpm.eth aragonpm.
const apm = kreditsArappConfig.apmDomain || argv['apmDomain'] || 'open.aragonpm.eth'

// daoFactory is environment specific.
// See https://github.com/aragon/deployments/tree/master/environments/ for the official daoFactory
// Locally we deploy our own daoFactory and no daoFactory is required (`daoFactoryAddress` is null).
const daoFactoryAddress = kreditsArappConfig.daoFactory || argv['daoFactory']

const ensAddr = arapp.environments[environment].registry || argv['ensAddress']


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

  const apps = fs.readdirSync('./apps', { withFileTypes: true })
                 .filter(e => e.isDirectory())
                 .map(e => e.name);
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

    callback();
  }).catch((e) => {
    console.log(e);
    callback(e);
  })
}
