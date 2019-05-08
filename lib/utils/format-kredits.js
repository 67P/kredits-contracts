const ethersUtils = require('ethers').utils;

module.exports = function(value, options = {}) {
  let etherValue = ethersUtils.formatEther(value);
  if (options.asFloat) {
    return parseFloat(etherValue);
  } else {
    return parseInt(etherValue);
  }
};
