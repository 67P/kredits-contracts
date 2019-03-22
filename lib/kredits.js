const ethers = require('ethers');
const RSVP = require('rsvp');

const Preflight = require('./utils/preflight');

const ABIS = {
  Contributor: require('./abis/Contributor.json'),
  Contribution: require('./abis/Contribution.json'),
  Token: require('./abis/Token.json'),
  Proposal: require('./abis/Proposal.json'),
  Kernel: require('./abis/Kernel.json')
};
const APP_CONTRACTS = [
  'Contributor',
  'Contribution',
  'Token',
  'Proposal'
];
const DaoAddresses = require('./addresses/dao.json');

const Contracts = require('./contracts');
const IPFS = require('./utils/ipfs')

// Helpers
function capitalize(word) {
  let [first, ...rest] = word;
  return `${first.toUpperCase()}${rest.join('')}`;
}

class Kredits {

  constructor(provider, signer, options = {}) {
    let { addresses, abis, ipfsConfig } = options;

    this.provider = provider;
    this.signer = signer;
    // by default we only need the DAO/Kernel address.
    // the rest is loaded from there in the init() function
    this.addresses = addresses || { Kernel: DaoAddresses[this.provider.chainId.toString()] }; // chainID must be a string
    this.abis = abis || ABIS;
    this.ipfs = new IPFS(ipfsConfig);
    this.contracts = {};
  }

  init(names) {
    let contractsToLoad = names || APP_CONTRACTS;
    let addressPromises = contractsToLoad.map((contractName) => {
      return this.Kernel.getApp(contractName).then((address) => {
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
    return new Kredits(provider, signer, { ipfsConfig: ipfsConfig }).init();
  }

  get Kernel() {
    return this.contractFor('Kernel');
  }

  get Contributor() {
    // TODO: rename to contributor
    return this.contractFor('Contributor');
  }

  get Contributors() {
    console.log('Contributors is deprecated use Contributor instead');
    return this.Contributor;
  }

  get Proposal() {
    return this.contractFor('Proposal');
  }

  get Token() {
    return this.contractFor('Token');
  }

  get Contribution() {
    return this.contractFor('Contribution');
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

  preflightChecks() {
    return new Preflight(this).check();
  }
}

module.exports = Kredits;
