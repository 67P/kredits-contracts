const homedir = require('homedir')
const path = require('path')

const provider = require('eth-provider')

const HDWalletProvider = require('truffle-hdwallet-provider')
const HDWalletProviderPrivkey = require('truffle-hdwallet-provider-privkey')

const settingsForNetwork = (network) => {
  try {
    let settingsPath = process.env.KEY_FILE || path.join(homedir(), `.aragon/${network}.json`)
    return require(settingsPath)
  } catch (e) {
    return null;
  }
}

const providerForNetwork = (network) => (
  () => {
    let settings = settingsForNetwork(network);
    if (settings) {
      return new HDWalletProviderPrivkey(settings.keys, settings.rpc)
    } else {
      let preset;
      if (network === 'mainnet') {
        preset = 'infura';
      } else {
        let [first, ...rest] = network;
        preset = `infura${first.toUpperCase()}${rest.join('')}`;
      }
      return provider(['frame', 'local', preset]);
    }
  }
)
module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      network_id: '*'
    },
    mainnet: {
      network_id: 1,
      provider: providerForNetwork('mainnet')
    },
    rinkeby: {
      network_id: 4,
      provider: providerForNetwork('rinkeby')
    },
    kovan: {
      network_id: 42,
      provider: providerForNetwork('kovan')
    },
    goerli: {
      network_id: 5,
      provider: providerForNetwork('goerli')
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,
      gas: 0xffffffffff,
      gasPrice: 0x01
    }
  },
  compilers: {
    solc: {
      version: "0.4.24"
    }
  }
}
