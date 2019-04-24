class Preflight {
  constructor (kredits) {
    this.kredits = kredits;
  }

  check () {
    return this.kredits.ipfs.peerId()
      .catch((error) => {
        const ipfsConfig = JSON.stringify(this.kredits.ipfs.config);
        throw new Error(`IPFS node not available; config: ${ipfsConfig} - ${error.message}`);
      })
      .then(() => {
        let promises = Object.keys(this.kredits.contracts).map((name) => {
          let address = this.kredits.contracts[name].contract.address;

          // TODO: I think this throws the error: Error: contract not deployed
          // I guess we don't need that if check anymore...
          return this.kredits.provider.getCode(address).then((code) => {
            // not sure if we always get the same return value if the code is not available
            // so checking if it is < 5 long
            if (code === '0x00' || code.length < 5) {
              throw new Error(`Contract for: ${name} not found at ${address} on network ${this.kredits.networkId}`);
            }

            return true;
          });
        });

        return Promise.all(promises);
      });
  }
}

module.exports = Preflight;
