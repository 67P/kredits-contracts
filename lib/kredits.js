const ethers = require('ethers');

const Preflight = require('./utils/preflight');
const deprecate = require('./utils/deprecate');

const ABIS = {
  Contributor: require('./abis/Contributor.json'),
  Contribution: require('./abis/Contribution.json'),
  Reimbursement: require('./abis/Reimbursement.json'),
  Token: require('./abis/Token.json'),
};
// const APP_CONTRACTS = [
//   'Contributor',
//   'Contribution',
//   'Token',
//   'Reimbursement',
// ];
const Addresses = require('./addresses.json');

const Contracts = require('./contracts');
const IPFS = require('./utils/ipfs');

// Helpers
function capitalize (word) {
  let [first, ...rest] = word;
  return `${first.toUpperCase()}${rest.join('')}`;
}

class Kredits {

  constructor (provider, signer, options = {}) {
    const { addresses, abis, ipfsConfig } = options;

    this.provider = provider;
    this.signer = signer;
    this.options = options;
    this.addresses = addresses || {};
    this.abis = abis || ABIS;
    this.ipfs = new IPFS(ipfsConfig);
    this.contracts = {};
  }

  init (/* names */) {
    // TODO implement
    // const contractsToLoad = names || APP_CONTRACTS;

    return this.provider.getNetwork().then(network => {
      if (Object.keys(this.addresses).length === 0) {
        this.addresses = Addresses[network.chainId.toString()];
      }
      return this;
    });
  }

  static setup (provider, signer, ipfsConfig = null) {
    deprecate('Kredits.setup() is deprecated use new Kredits().init() instead');
    return new Kredits(provider, signer, { ipfsConfig: ipfsConfig }).init();
  }

  static for (connectionOptions, kreditsOptions) {
    let { network, rpcUrl, wallet } = connectionOptions;
    if (!rpcUrl && network === 'local') { rpcUrl = 'http://localhost:8545'; }
    let ethProvider, signer;
    if (rpcUrl) {
      ethProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
    } else {
      ethProvider = new ethers.getDefaultProvider(network);
    }
    if (wallet) {
      signer = wallet.connect(ethProvider);
    } else if (ethProvider.getSigner) {
      // Only useful for reading data, not writing. The (unused) address is
      // necessary because without an address, ethers.js will try to look up
      // the provider's account 0, which doesn't work on our public RSK nodes.
      signer = ethProvider.getSigner('0xfa77675540E550b911a6AABF3805ac17C6641ec1');
    }
    return new Kredits(ethProvider, signer, kreditsOptions);
  }

  static availableNetworks () {
    return Object.keys(Addresses);
  }

  get Contributor () {
    return this.contractFor('Contributor');
  }

  get Contributors () {
    deprecate('Contributors is deprecated use Contributor instead');
    return this.contractFor('Contributor');
  }

  get Operator () {
    return this.Proposal;
  }

  get Token () {
    return this.contractFor('Token');
  }

  get Contribution () {
    return this.contractFor('Contribution');
  }

  get Reimbursement () {
    return this.contractFor('Reimbursement');
  }

  // Should be private
  contractFor (name) {
    if (this.contracts[name]) {
      return this.contracts[name];
    }

    const contractName = capitalize(name);
    const address = this.addresses[contractName];
    const abi = this.abis[contractName];
    if (!address || !abi) {
      throw new Error(`Address or ABI not found for ${contractName}`);
    }

    const signerOrProvider = this.signer || this.provider;
    const contract = new ethers.Contract(address, abi, signerOrProvider);
    this.contracts[name] = new Contracts[contractName](contract);
    this.contracts[name].ipfs = this.ipfs;

    return this.contracts[name];
  }

  preflightChecks () {
    return new Preflight(this).check();
  }
}

module.exports = Kredits;
