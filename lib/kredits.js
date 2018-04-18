const ethers = require('ethers');
const RSVP = require('rsvp');

const abis = {
  Contributors: require('./abis/Contributors.json'),
  Operator: require('./abis/Operator.json'),
  Registry: require('./abis/Registry.json'),
  Token: require('./abis/Token.json')
};
const addresses = {
  Registry: require('./addresses/Registry.json')
};

const contracts = require('./contracts');
const IPFS = require('./utils/ipfs')

// Helpers
function capitalize(word) {
  let [first, ...rest] = word;
  return `${first.toUpperCase()}${rest.join('')}`;
}

class Kredits {
  static get contractNames() {
    return Object.keys(abis);
  }

  constructor(provider, signer, addresses) {
    this.provider = provider;
    this.signer = signer;

    // Initialize our registry contract
    this.addresses = addresses;
    this.contracts = {};
    this.ipfs = new IPFS();
  }

  static setup(provider, signer, ipfsConfig = null) {
    let ipfsAPI = new IPFS(ipfsConfig);

    return ipfsAPI._ipfsAPI.id().catch((error) => {
      throw new Error(`IPFS node not available; config: ${JSON.stringify(ipfsConfig)} - ${error.message}`);
    }).then(() => {

      let registryContract = this.initRegistryContract(provider);

      let addresses = Kredits.contractNames.reduce((mem, name) => {
        let contractName = capitalize(name);
        mem[contractName] = registryContract.functions.getProxyFor(contractName).catch((error) => {
          throw new Error(`Failed to get address for ${contractName} from registry at ${registryContract.address}
            - correct registry? does it have version entry? - ${error.message}`
          );
        });
        return mem;
      }, {});

      return RSVP.hash(addresses)
        .then((addresses) => {
          let kredits = new Kredits(provider, signer, addresses);
          kredits.ipfs = ipfsAPI;
          return kredits;
        });
    });
  }

  static initRegistryContract(provider) {
    let address = addresses['Registry'][provider.chainId];
    if (!address) {
      throw new Error(`Registry address not found; invalid network?
        requested network: ${provider.chainId}
        supported networks: ${Object.keys(addresses['Registry'])}
      `);
    }
    provider.getCode(address).then((code) => {
      // not sure if we always get the same return value of the code is not available
      // that's why checking if it is < 5 long
      if (code === '0x00' || code.length < 5) {
        throw new Error(`Registry not found at ${address} on network ${provider.chainId}`);
      }
    });
    let abi = abis['Registry'];
    return new ethers.Contract(address, abi, provider);
  }

  get Contributor() {
    // TODO: rename to contributor
    return this.contractFor('contributors');
  }

  get Operator() {
    return this.contractFor('operator');
  }

  get Token() {
    return this.contractFor('token');
  }

  // Should be private
  contractFor(name) {
    if (this.contracts[name]) {
      return this.contracts[name];
    }

    let contractName = capitalize(name);
    let address = this.addresses[contractName];
    if (!address || !abis[contractName]) {
      throw new Error(`Address or ABI not found for ${contractName}`);
    }
    let contract = new ethers.Contract(address, abis[contractName], this.signer);
    this.contracts[name] = new contracts[contractName](contract);
    this.contracts[name].ipfs = this.ipfs;

    return this.contracts[name];
  }
}

module.exports = Kredits;
