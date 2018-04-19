const ethers = require('ethers');
const RSVP = require('rsvp');

const ABIs = {
  Contributors: require('./abis/Contributors.json'),
  Operator: require('./abis/Operator.json'),
  Registry: require('./abis/Registry.json'),
  Token: require('./abis/Token.json')
};
const ADDRESSES = {
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
    return Object.keys(ABIs);
  }

  constructor(provider, signer, addresses) {
    this.provider = provider;
    this.signer = signer;

    // Initialize our registry contract
    this.addresses = addresses || ADDRESSES[this.provider.chainId];
    this.abis = ABIs;
    this.contracts = {};
    this.ipfs = new IPFS();
  }

  init(names) {
    let contractsToLoad = names || Kredits.contractNames;
    let addressPromises = contractsToLoad.map((contractName) => {
      return this.Registry.functions.getProxyFor(contractName).then((address) => {
        this.addresses[contractName] = address;
      }).catch((error) => {
        throw new Error(`Failed to get address for ${contractName} from registry at ${this.Registry.address}
          - correct registry? does it have version entry? - ${error.message}`
        );
      });
    });
    return RSVP.all(addressPromises).then(() => { return this });
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
    let address = ADDRESSES['Registry'][provider.chainId];
    if (!address) {
      throw new Error(`Registry address not found; invalid network?
        requested network: ${provider.chainId}
        supported networks: ${Object.keys(ADDRESSES['Registry'])}
      `);
    }
    provider.getCode(address).then((code) => {
      // not sure if we always get the same return value of the code is not available
      // that's why checking if it is < 5 long
      if (code === '0x00' || code.length < 5) {
        throw new Error(`Registry not found at ${address} on network ${provider.chainId}`);
      }
    });
    let abi = ABIs['Registry'];
    return new ethers.Contract(address, abi, provider);
  }

  get Registry() {
    return this.contractFor('registry');
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
    let abi = this.abis[contractName];
    if (!address || !abi) {
      throw new Error(`Address or ABI not found for ${contractName}`);
    }
    let contract = new ethers.Contract(address, abi, this.signer);
    this.contracts[name] = new contracts[contractName](contract);
    this.contracts[name].ipfs = this.ipfs;

    return this.contracts[name];
  }
}

module.exports = Kredits;
