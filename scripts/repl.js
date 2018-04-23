const REPL = require('repl');
const promptly = require('promptly');

const ethers = require('ethers');
const Kredits = require('../lib/kredits');

module.exports = function(callback) {
  const Registry = artifacts.require('./Registry.sol');
  Registry.deployed().then(async (registry) => {
    const networkId = parseInt(web3.version.network);
    const provider = new ethers.providers.Web3Provider(
      web3.currentProvider, { chainId: networkId }
    );
    const kredits = await Kredits.setup(provider, provider.getSigner());
    console.log(`defined variables: kredits, web3`);
    let r = REPL.start();
    r.context.kredits = kredits;
    r.context.web3 = web3;

    r.on('exit', () => {
      console.log('Bye');
      callback();
    });
  });
}
