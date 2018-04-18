class Base {
  constructor(contract) {
    this.contract = contract;
  }

  get functions() {
    return this.contract.functions;
  }

  get ipfs() {
    if (!this._ipfsAPI) { throw new Error('IPFS API not configured; please set an ipfs instance'); }
    return this._ipfsAPI;
  }

  set ipfs(ipfsAPI) {
    this._ipfsAPI = ipfsAPI;
  }

  on(type, callback) {
    let eventMethod = `on${type.toLowerCase()}`;
    // Don't use this.contract.events here. Seems to be a bug in ethers.js
    this.contract[eventMethod] = callback;

    return this;
  }
}
module.exports = Base;
