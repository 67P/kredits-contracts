const argv = require('yargs').argv;
const ethers = require('ethers');
const Kredits = require('../../lib/kredits');

const arapp = require('../../arapp.json');
const environment = argv['network'] || argv['environment'] || 'development';
const apm = arapp.environments[environment].apm;

module.exports = async function(web3) {
  return new Promise((resolve, reject) => {
    const provider = new ethers.providers.Web3Provider(web3.currentProvider);
    const signer = provider.getSigner();
    // checking if siner supports signing transactions
    signer.getAddress().then(_ => {
      new Kredits(provider, signer, { apm }).init().then(kredits => {
        resolve(kredits);
      }).catch(e => {
        reject(e);
      });
    }).catch(e => {
      console.log(`Signer account not available; readonly connection (${e.message}`);
      new Kredits(provider, null, { apm }).init().then(kredits => {
        resolve(kredits);
      }).catch(e => {
        reject(e);
      });
    })
  });
}
