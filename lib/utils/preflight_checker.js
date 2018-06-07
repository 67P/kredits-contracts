class PreflightChecker {
  constructor(kredits) {
    this.kredits = kredits;
  }

  check() {
    return this.kredits.ipfs._ipfsAPI.id()
      .catch((error) => {
        throw new Error(`IPFS node not available; config: ${JSON.stringify(this.kredits.ipfs.config)} - ${error.message}`);
      })
      .then(() => {
        let promises = Object.keys(this.kredits.contracts).map((name) => {
          let contractWrapper = this.kredits.contracts[name];
          return this.kredits.provider.getCode(contractWrapper.contract.address).then((code) => {
            // not sure if we always get the same return value if the code is not available
            // so checking if it is < 5 long
            if (code === '0x00' || code.length < 5) {
              throw new Error(`Contract for: ${name} not found at ${contractWrapper.contract.address} on network ${this.kredits.provider.chainId}`);
            }
            return true;
          });
        });
        return Promise.all(promises);
      });
  }
}

module.exports = PreflightChecker;
