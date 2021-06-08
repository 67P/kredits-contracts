const promptly = require('promptly');
const { inspect } = require('util');

const { ethers } = require("hardhat");
const Kredits = require('../lib/kredits');

async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner())
  await kredits.init();

  console.log(`Using Contributions at: ${kredits.Contribution.contract.address}`);

  let contributor = await promptly.prompt('Contributor (address or id): ');
  let contributorId;
  let contributorAccount;
  if (contributor.length < 5) {
    contributorId = contributor;
    contributorAccount = await kredits.Contributor.contract.getContributorAddressById(contributor);
  } else {
    contributorAccount = contributor;
    contributorId = await kredits.Contributor.contract.getContributorIdByAddress(contributor);
  }

  console.log(`Creating a contribution for contributor account ${contributorAccount} ID: ${contributorId}`);

  [ dateNow, timeNow ] = (new Date()).toISOString().split('T');

  let contributionAttributes = {
    contributorId,
    date: dateNow,
    time: timeNow,
    amount: await promptly.prompt('Amount: '),
    description: await promptly.prompt('Description: '),
    kind: await promptly.prompt('Kind: ', { default: 'dev' }),
    url: await promptly.prompt('URL: ', { default: '' })
  }

  const contributorData = await kredits.Contributor.getById(contributorId);
  contributionAttributes.contributorIpfsHash = contributorData.ipfsHash;

  console.log("\nAdding contribution:");
  console.log(contributionAttributes);

  kredits.Contribution.add(contributionAttributes, { gasLimit: 300000 })
    .then(result => {
      console.log("\n\nResult:");
      console.log(result);
    })
    .catch(error => {
      console.log('Failed to create contribution');
      console.log(error);
    });
}

main();
