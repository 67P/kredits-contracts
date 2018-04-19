const Registry = artifacts.require('./Registry.sol');
const Operator = artifacts.require('./Operator.sol');
const Contributors = artifacts.require('./Contributors.sol');
const promptly = require('promptly');

const IPFS = require('../lib/utils/ipfs');
const ipfs = new IPFS();
const bs58 = require('bs58');

const ethers = require('ethers');
const Kredits = require('../lib/kredits');

async function prompt(message, options) {
  if (!options) {
    options = {default: ''}
  }
  return await promptly.prompt(message, options);
}
module.exports = function(callback) {
  Registry.deployed().then(async (registry) => {

    console.log(`Using registry at: ${registry.address}`);
    let networkId = parseInt(web3.version.network);
    console.log(web3.currentProvider);
    let provider = new ethers.providers.Web3Provider(
      web3.currentProvider,
      { chainId: networkId }
    )
    console.log(provider.getSigner());
    const kredits = await new Kredits(provider, provider.getSigner(), {Registry: registry.address}).init();
    console.log(`Using contributors at: ${kredits.Contributor.address}`);
    let contributorAttributes = {
      account: await prompt('Contributor address: ', {}),
      name: await prompt('Name: '),
      isCore: await prompt('core? y/n') === 'y',
      kind: await prompt('Kind (default person): ', {default: 'person'}),
      url: await prompt('URL: '),
      github_username: await prompt('GitHub username: '),
      github_uid: await prompt('GitHub UID: '),
      wiki_username: await prompt('Wiki username: '),
    }

    contributorAttributes = {
      account: '0x398ac9cdb122e6f526c8bf8dd80eeeb18fce8821',
      name: 'bumi',
      isCore: '1'
    }
    console.log("\nCreating new contributor with following attributes:");
    console.log(contributorAttributes);
    kredits.Contributor.functions.addContributor('0x398ac9cdb122e6f526c8bf8dd80eeeb18fce8821',
      '0x272bbfc66166f26cae9c9b96b7f9590e095f02edf342ac2dd71e1667a12116ca', 18, 32, true).then((r) => {
        console.log(r);
        process.exit();
      });
    /*
      kredits.Contributor.add(contributorAttributes).then((result) => {
      console.log(result);
      callback();
    }).catch((error) => {
      console.log('Failed to create contributor');
      callback(error);
    });
    */
  });
}
