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

  get ipfs () {
    if (!this._ipfsAPI) { throw new Error('IPFS API not configured; please set an ipfs instance'); }
    return this._ipfsAPI;
  }

  set ipfs (ipfsAPI) {
    this._ipfsAPI = ipfsAPI;
  }

  on (type, callback) {
    return this.contract.on(type, callback);
  }
}

module.exports = Base;
