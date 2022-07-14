const promptly = require('promptly');

const { ethers } = require("hardhat");
const Kredits = require('../lib/kredits');

async function prompt(message, options) {
  if (!options) {
    options = {default: ''}
  }
  return await promptly.prompt(message, options);
}
async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner())
  await kredits.init();

  console.log(`Using contributors at: ${kredits.Contributor.contract.address}`);

  let contributorAttributes = {
    account: await prompt('Contributor address: ', {}),
    name: await prompt('Name: '),
    kind: await prompt('Kind (default person): ', {default: 'person'}),
    url: await prompt('URL: '),
    github_username: await prompt('GitHub username: '),
    github_uid: parseInt(await prompt('GitHub UID: ')),
    wiki_username: await prompt('Wiki username: '),
  };

  console.log("\nAdding contributor:");
  console.log(contributorAttributes);

  kredits.Contributor.add(contributorAttributes, { gasLimit: 350000 }).then((result) => {
    console.log("\n\nResult:");
    console.log(result);
  }).catch((error) => {
    console.log('Failed to create contributor');
    console.log(error);
  });
}

main();
