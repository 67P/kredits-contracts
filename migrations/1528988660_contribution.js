var Registry = artifacts.require('./Registry.sol');
var Contribution = artifacts.require('./Contribution.sol');

module.exports = function(deployer) {
  deployer.deploy(Contribution).then(function(contribution) {
    console.log('Registry address: ', Registry.address);
    console.log('Contribution address: ', Contribution.address);
    Registry.deployed().then(function(registry) {
      registry.addVersion('Contribution', Contribution.address);
      registry.createProxy('Contribution', 1);
    });
  });
};
