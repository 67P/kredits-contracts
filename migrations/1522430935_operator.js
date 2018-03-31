var Registry = artifacts.require('./Registry.sol');
var Operator = artifacts.require('./Operator.sol');

module.exports = function(deployer) {
  deployer.deploy(Operator).then(function(operator) {
    console.log('Registry address: ', Registry.address);
    console.log('Operator address: ', Operator.address);
    Registry.deployed().then(function(registry) {
      registry.addVersion('Operator', Operator.address);
      registry.createProxy('Operator', 1);
    });
  });
};
