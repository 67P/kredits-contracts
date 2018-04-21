const ethers = require('ethers');
const RSVP = require('rsvp');

const Healthcheck = require('./utils/healthcheck');

const ABIS = {
  Contributors: require('./abis/Contributors.json'),
  Operator: require('./abis/Operator.json'),
  Registry: require('./abis/Registry.json'),
  Token: require('./abis/Token.json')
};
const RegistryAddress = require('./addresses/Registry.json');

const Contracts = require('./contracts');
const IPFS = require('./utils/ipfs')

// Helpers
function capitalize(word) {
  let [first, ...rest] = word;
  return `${first.toUpperCase()}${rest.join('')}`;
}

class Kredits {

  constructor(provider, signer, addresses) {
    this.provider = provider;
    this.signer = signer;

    // by default we only need the registry address.
    // the rest is loaded from there in the init() function
    this.addresses = addresses || {Registry: RegistryAddress[this.provider.chainId.toString()]}; // chaiID must be a string
    this.abis = ABIS;
    this.contracts = {};
    this.ipfs = new IPFS();
  }

  init(names) {
    let contractsToLoad = names || Object.keys(ABIS);
    let addressPromises = contractsToLoad.map((contractName) => {
      return this.Registry.functions.getProxyFor(contractName).then((address) => {
        this.addresses[contractName] = address;
      }).catch((error) => {
        throw new Error(`Failed to get address for ${contractName} from registry at ${this.Registry.contract.address}
          - correct registry? does it have version entry? - ${error.message}`
        );
      });
    });
    return RSVP.all(addressPromises).then(() => { return this });
  }

  static setup(provider, signer, ipfsConfig = null) {
    console.log('Kredits.setup() is deprecated use new Kredits().init() instead');
    let ipfs = new IPFS(ipfsConfig);
    return new Kredits(provider, signer).init().then((kredits) => {
      kredits.ipfs = ipfs;
      return kredits;
    });
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

    const contractName = capitalize(name);
    const address = this.addresses[contractName];
    const abi = this.abis[contractName];
    if (!address || !abi) {
      throw new Error(`Address or ABI not found for ${contractName}`);
    }

    let signerOrProvider = this.signer || this.provider;
    let contract = new ethers.Contract(address, abi, signerOrProvider);
    this.contracts[name] = new Contracts[contractName](contract);
    this.contracts[name].ipfs = this.ipfs;

    return this.contracts[name];
  }

  healthcheck() {
    return new Healthcheck(this).check();
  }
}

module.exports = Kredits;
