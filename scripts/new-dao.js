const fs = require('fs');
const path = require('path');

const ethers = require('ethers');
const fileInject = require('./helpers/file_inject.js');
const KreditsKit = require('../lib/kreditskit');

const addressesPath = path.join(__dirname, '..', 'lib/addresses');

module.exports = async function(callback) {
  const provider = new ethers.providers.Web3Provider(web3.currentProvider);
  const signer = provider.getSigner();
  const network = await provider.getNetwork();
  const networkId = network.chainId;
  console.log(`Deploying to networkId: ${networkId}`)

  let kitAddresseFile = path.join(addressesPath, 'KreditsKit.json');
  let kitAddresses = JSON.parse(fs.readFileSync(kitAddresseFile));
  let kreditsKitAddress = process.env.KREDITS_KIT || kitAddresses[networkId]
  if (!kreditsKitAddress) {
    callback(new Error("KreditsKit address not found in environment variable KREDITS_KIT"))
  }
  console.log(`Using KreditsKit at: ${kreditsKitAddress}`);

  let kit = await new KreditsKit(provider, signer).init()

  // TODO: get rid of the hard coded gas limit
  kit.newDAO({ gasLimit: 10000000 }).then(result => {
    console.log(result);
    fileInject(path.join(addressesPath, 'dao.json'), networkId, result.daoAddress)

    console.log(`\n\nCreated new DAO at: ${result.daoAddress}`)

    callback();
  }).catch((err) => {
    console.log('failed to create a new DAO')
    callback(err)
  })
}
