const promptly = require('promptly');
const { inspect } = require('util');

const initKredits = require('./helpers/init_kredits.js');

module.exports = async function(callback) {
  let kredits;
  try {
    kredits = await initKredits(web3);
  } catch(e) {
    callback(e);
    return;
  }

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

  kredits.Contribution.addContribution(contributionAttributes, { gasLimit: 300000 })
    .then(result => {
      console.log("\n\nResult:");
      console.log(result);
      callback();
    })
    .catch(error => {
      console.log('Failed to create contribution');
      callback(inspect(error));
    });
}
