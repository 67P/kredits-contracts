var Registry = artifacts.require('./upgradeable/Registry.sol');

var Token = artifacts.require('./Token1.sol');

module.exports = function(deployer) {
  deployer.deploy(Registry).then(function() {
    return Registry.deployed();
  }).then(function(registry) {
    return deployer.deploy(Token);
  }).then(function(token) {
    console.log('Registry address: ', Registry.address);
    console.log('Token address: ', Token.address);
    Registry.deployed().then(function(registry) {
      registry.addVersion('Token_1.0', Token.address);
      registry.createProxy('Token_1.0').then(function(r) {
        console.log(r.logs[0]);
      });
    });
  });
};


