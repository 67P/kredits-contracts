const REPL = require('repl');
const promptly = require('promptly');

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

    let contractAddress = await registry.getProxyFor(contractName);
    console.log(`Using ${contractName} at ${contractAddress}`);
    let contract = await artifacts.require(`./${contractName}`).at(contractAddress);

    if (!contract[method]) {
      callback(new Error(`Method ${method} is not defined on ${contractName}`));
      return;
    }
    console.log(`Calling ${method} with ${JSON.stringify(args)}`);

    contract[method](...args).then((result) => {
      console.log("\nResult:");
      console.log(result);

      console.log("\nStartig a REPL. (type .exit to exit)");
      console.log(`defined variables: result, ${contractName}, web3`);
      let r = REPL.start();
      r.context.result = result;
      r.context[contractName] = contract;
      r.context.web3 = web3;

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
