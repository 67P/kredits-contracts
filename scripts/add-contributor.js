const Registry = artifacts.require('./Registry.sol');
const promptly = require('promptly');
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

    const networkId = parseInt(web3.version.network);
    const provider = new ethers.providers.Web3Provider(
      web3.currentProvider, { chainId: networkId }
    );
    const kredits = await Kredits.setup(provider, provider.getSigner());

    console.log(`Using contributors at: ${kredits.Contributor.contract.address}`);

    let contributorAttributes = {
      account: await prompt('Contributor address: ', {}),
      name: await prompt('Name: '),
      isCore: await prompt('core? y/n') === 'y',
      kind: await prompt('Kind (default person): ', {default: 'person'}),
      url: await prompt('URL: '),
      github_username: await prompt('GitHub username: '),
      github_uid: await prompt('GitHub UID: '),
      wiki_username: await prompt('Wiki username: '),
    };

    console.log("\nAdding contributor:");
    console.log(contributorAttributes);

    kredits.Contributor.add(contributorAttributes, {gasLimit: 250000}).then((result) => {
      console.log("\n\nResult:");
      console.log(result);
      callback();
    }).catch((error) => {
      console.log('Failed to create contributor');
      callback(error);
    });

  });
}
