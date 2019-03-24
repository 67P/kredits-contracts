const deployDAOFactory = require('@aragon/os/scripts/deploy-daofactory.js')

const fs = require('fs');
const path = require('path');
const libPath = path.join(__dirname, '..', 'lib');
const addressesPath = path.join(libPath, 'addresses');

const KreditsKit = artifacts.require('KreditsKit')

const ensAddr = process.env.ENS
const daoFactoryAddress = process.env.DAO_FACTORY

module.exports = async function(callback) {
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

  let kreditsKit = await KreditsKit.new(daoFactory.address, ensAddr)

  const networkId = parseInt(web3.version.network);

  let addresseFile = path.join(addressesPath, `KreditsKit.json`);
  let addresses = JSON.parse(fs.readFileSync(addresseFile));

  addresses[networkId] = kreditsKit.address;
  fs.writeFileSync(addresseFile, JSON.stringify(addresses));

  console.log(`Deployed KreditsKit at: ${kreditsKit.address}`);
  callback();
}
