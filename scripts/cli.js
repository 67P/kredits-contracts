const REPL = require('repl');
const promptly = require('promptly');

const ethers = require('ethers');
const Kredits = require('../lib/kredits');

const getNetworkId = require('./helpers/networkid.js')

module.exports = async function(callback) {
  const networkId = await getNetworkId(web3)
  const provider = new ethers.providers.Web3Provider(
    web3.currentProvider, { chainId: parseInt(networkId) }
  );

  new Kredits(provider, provider.getSigner()).init().then(async function(kredits) {
    let contractName = await promptly.prompt('Contract Name: ');
    const contractWrapper = kredits[contractName];

    let method;
    method = await promptly.prompt('Function (? for available functions): ');
    while (method === '?') {
      console.log(`Contract functions: ${JSON.stringify(Object.keys(contractWrapper.functions))}`);
      console.log(`\nWrapper functions: ${JSON.stringify(Object.getOwnPropertyNames(Object.getPrototypeOf(contractWrapper)))}`);
      console.log("\n");

      method = await promptly.prompt('Function: ');
    }
    if (!contractWrapper[method] && !contractWrapper.functions[method]) {
      callback(new Error(`Method ${method} is not defined on ${contractName}`));
      return;
    }
    let argumentInput = await promptly.prompt('Arguments (comma separated): ', { default: '' });
    let args = [];
    if (argumentInput !== '') {
      args = argumentInput.split(',').map(a => a.trim());
    }
    console.log(`Using ${contractName} at ${contractWrapper.contract.address}`);
    console.log(`Calling ${method} with ${JSON.stringify(args)}`);

    let func;
    if (contractWrapper[method]) {
      func = contractWrapper[method];
    } else {
      func = contractWrapper.functions[method];
    }
    func.apply(contractWrapper, args).then((result) => {
      console.log("\nResult:");
      console.log(result);

      console.log("\nStartig a REPL. (type .exit to exit)");
      console.log(`defined variables: result, ${contractName}, kredis`);
      let r = REPL.start();
      r.context.result = result;
      r.context[contractName] = contractWrapper;
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
