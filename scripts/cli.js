const REPL = require('repl');
const promptly = require('promptly');

const ethers = require('ethers');
const Kredits = require('../lib/kredits');

module.exports = function(callback) {
  const Registry = artifacts.require('./Registry.sol');
  Registry.deployed().then(async (registry) => {
    let contractName = await promptly.prompt('Contract Name: ');
    let method = await promptly.prompt('Function: ');
    let argumentInput = await promptly.prompt('Arguments (comma separated): ', { default: '' });
    let args = [];
    if (argumentInput !== '') {
      args = argumentInput.split(',').map(a => a.trim());
    }

    const networkId = parseInt(web3.version.network);
    const provider = new ethers.providers.Web3Provider(
      web3.currentProvider, { chainId: networkId }
    );
    const kredits = await Kredits.setup(provider, provider.getSigner());

    const contract = kredits[contractName].contract;
    console.log(`Using ${contractName} at ${contract.address}`);
    console.log(`Calling ${method} with ${JSON.stringify(args)}`);

    if (!contract[method]) {
      callback(new Error(`Method ${method} is not defined on ${contractName}`));
      return;
    }

    contract[method](...args).then((result) => {
      console.log("\nResult:");
      console.log(result);

      console.log("\nStartig a REPL. (type .exit to exit)");
      console.log(`defined variables: result, ${contractName}, kredis`);
      let r = REPL.start();
      r.context.result = result;
      r.context[contractName] = contract;
      r.context.kredits = kredits;

      r.on('exit', () => {
        console.log('Bye');
        callback();
      })
    }).catch((error) => {
      console.log("Call failed. Probably the contract raised an error?\n");
      console.log("...");
      callback(error);
    });

  })

}
