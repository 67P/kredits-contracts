class Healthcheck {
  constructor(kredits) {
    this.kredits = kredits;
  }

  check() {
    return this.kredits.ipfs._ipfsAPI.id()
      .catch((error) => {
        throw new Error(`IPFS node not available; config: ${JSON.stringify(this.kredits.ipfs.config)} - ${error.message}`);
      })
      .then(() => {
        return Object.keys(this.kredits.contracts).map((name) => {
          let contract = this.kredits.contracts[name];
          this.kredits.provider.getCode(contract.address).then((code) => {
            // not sure if we always get the same return value of the code is not available
            // that's why checking if it is < 5 long
            if (code === '0x00' || code.length < 5) {
              throw new Error(`Registry not found at ${contract.address} on network ${this.kredits.provider.chainId}`);
            }
          });
        });
      });
  }
}
