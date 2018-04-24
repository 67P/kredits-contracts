const path = require('path');
const seeds = require(path.join(__dirname, '..', '/config/seeds.js'));

const ethers = require('ethers');
const Kredits = require('../lib/kredits');

const each = require('async-each-series');

module.exports = function(callback) {
  const Registry = artifacts.require('./Registry.sol');

  Registry.deployed().then(async (registry) => {

    const networkId = parseInt(web3.version.network);
    const provider = new ethers.providers.Web3Provider(
      web3.currentProvider, { chainId: networkId }
    );
    const kredits = await Kredits.setup(provider, provider.getSigner());

    each(seeds.contractCalls, (call, next) => {
      let [contractName, method, args] = call;
      let contractWrapper = kredits[contractName];
      let func;
      if (contractWrapper[method]) {
        func = contractWrapper[method];
      } else {
        func = contractWrapper.functions[method];
      }
      func.apply(contractWrapper, args).then((result) => {
        console.log(`[OK] kredits.${contractName}.${method}(${JSON.stringify(args)}) => ${result.hash}`);
        next();
      }).catch((error) => {
        console.log(`[FAILD] kredits.${contractName}.${method}(${JSON.stringify(args)})`);
        callback(error)
      });
    }, () => { console.log("\nDone!") });

  });
}
