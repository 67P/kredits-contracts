var Token = artifacts.require('./Token2.sol');
var Registry = artifacts.require('./upgradeable/Registry');
var UpgradeabilityProxy = artifacts.require('./upgradeable/UpgradeabilityProxy');

module.exports = function(deployer) {
  deployer.deploy(Token).then(function(t) {
    return Token.deployed();
  }).then(function(token) {
    Registry.deployed().then(function(registry) {
      console.log('Token address: ', Token.address);
      registry.addVersion('Token_2.0', Token.address);
    });
  })
};
