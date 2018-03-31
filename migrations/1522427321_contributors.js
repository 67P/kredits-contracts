var Registry = artifacts.require('./Registry.sol');
var Contributors = artifacts.require('./Contributors.sol');

module.exports = function(deployer) {
  deployer.deploy(Contributors).then(function(contributors) {
    console.log('Registry address: ', Registry.address);
    console.log('Contributors address: ', Contributors.address);
    Registry.deployed().then(function(registry) {
      registry.addVersion('Contributors', Contributors.address);
      registry.createProxy('Contributors', 1);
    });
  });
};
