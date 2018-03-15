var Registry = artifacts.require('./Registry.sol');
var Token = artifacts.require('./Token.sol');

module.exports = function(deployer) {
  deployer.deploy(Token).then(function(token) {
    console.log('Registry address: ', Registry.address);
    console.log('Token address: ', Token.address);
    Registry.deployed().then(function(registry) {
      registry.addVersion('Token', Token.address);
    });
  });
};


