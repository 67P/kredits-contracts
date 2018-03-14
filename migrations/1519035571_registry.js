var Registry = artifacts.require('./upgradeable/Registry.sol');

module.exports = function(deployer) {
  deployer.deploy(Registry);
};
