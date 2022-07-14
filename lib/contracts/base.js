const deprecate = require('../utils/deprecate');

class Base {
  constructor (contract) {
    this.contract = contract;
  }

  get functions () {
    deprecate('The property `functions` is deprecated. contract functions are now directly defined on the ethers contract object. https://github.com/ethers-io/ethers.js/issues/920#issuecomment-650836642');
    return this.contract;
  }

  get address () {
    return this.contract.address;
  }

  on (type, callback) {
    return this.contract.on(type, callback);
  }
}

module.exports = Base;
