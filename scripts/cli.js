module.exports = function(callback) {
  const Registry = artifacts.require('./Registry.sol');
  Registry.deployed().then(async (registry) => {
    let contractName = process.argv[4];
    let method = process.argv[5];
    let args = process.argv.slice(6);

    if(!contractName) {
      console.log("Usage:")
      console.log("  truffle exec scripts/cli.js <Contract name> <method to call> [<optional> <arguments>]");
      callback();
      return;
    }

    let contractAddress = await registry.getProxyFor(contractName);
    console.log(`Using ${contractName} at ${contractAddress}`);
    let contract = await artifacts.require(`./${contractName}`).at(contractAddress);

    console.log(`Calling ${method} with ${JSON.stringify(args)}`);

    contract[method](...args).then((result) => {
      console.log('Result:');
      console.log(result);

      callback();
    }).catch((error) => {
      console.log("Call failed. Probably the contract raised an error?\n");
      console.log("...");
      callback(error);
    });

  })

}
