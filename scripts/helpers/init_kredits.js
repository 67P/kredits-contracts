const ethers = require('ethers');
const getNetworkId = require('./networkid.js')
const Kredits = require('../../lib/kredits');

module.exports = async function(web3) {
  return new Promise((resolve, reject) => {
    const provider = new ethers.providers.Web3Provider(web3.currentProvider);
    let signer = provider.getSigner();
    // checking if siner supports signing transactions
    signer.getAddress().then(_ => {
      new Kredits(provider, signer).init().then(kredits => {
        resolve(kredits);
      }).catch(e => {
        reject(e);
      });
    }).catch(e => {
      console.log(`Signer account not available; readonly connection (${e.message}`);
      new Kredits(provider, null).init().then(kredits => {
        resolve(kredits);
      }).catch(e => {
        reject(e);
      });
    })
  });
}
