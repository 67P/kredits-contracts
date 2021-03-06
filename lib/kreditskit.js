const ethers = require('ethers');

const ABI = require('./abis/KreditsKit.json');
const Addresses = require('./addresses/KreditsKit.json');

class KreditsKit {

  constructor (provider, signer, options = {}) {
    let { address, abi } = options;

    this.provider = provider;
    this.signer = signer;
    this.options = options;
    this.address = address;
    this.abi = abi || ABI;
  }

  init () {
    return this.provider.getNetwork().then((network) => {
      this.address = this.address || Addresses[network.chainId.toString()];
      this.contract = new ethers.Contract(
        this.address,
        this.abi,
        (this.signer || this.provider)
      );
      return this;
    });
  }

  appIdFor (contractName) {
    // see appIds in KreditsKit.sol for more details
    const knownContracts = ['Contribution', 'Contributor', 'Proposal', 'Token'];
    return this.contract.appIds(knownContracts.indexOf(contractName));
  }

  newDAO (options = {}) {
    return this.contract.newInstance(options).then(transaction => {
      return transaction.wait().then(result => {
        const deployEvent = result.events.find(e => e.event === 'DeployInstance');
        return {
          daoAddress: deployEvent.args.dao,
          transactionHash: transaction.hash,
        };
      });
    });
  }
}

module.exports = KreditsKit;
