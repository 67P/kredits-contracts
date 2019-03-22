const promptly = require('promptly');

const ethers = require('ethers');
const Kredits = require('../lib/kredits');

module.exports = async function(callback) {
  const networkId = parseInt(web3.version.network);
  const provider = new ethers.providers.Web3Provider(
    web3.currentProvider, { chainId: networkId }
  );
  const kredits = await new Kredits(provider, provider.getSigner()).init();

  console.log(`Using Contributions at: ${kredits.Contribution.contract.address}`);

  let contributor = await promptly.prompt('Contributor (address or id): ');
  let contributorId;
  if (contributor.length < 5) {
    contributorAccount = await kredits.Contributor.functions.getContributorAddressById(contributor);
  } else {
    contributorAccount = contributor;
  }
  console.log(`Creating a contribution for contributor Account #${contributorAccount}`);

  let contributionAttributes = {
    contributorAccount,
    amount: await promptly.prompt('Amount: '),
    description: await promptly.prompt('Description: '),
    kind: await promptly.prompt('Kind: ', { default: 'dev' }),
    url: await promptly.prompt('URL: ', { default: '' })
  }

  console.log("\nAdding contribution:");
  console.log(contributionAttributes);

  kredits.Contribution.addContribution(contributionAttributes, { gasLimit: 300000 }).then((result) => {
    console.log("\n\nResult:");
    console.log(result);
    callback();
  }).catch((error) => {
    console.log('Failed to create contribution');
    callback(error);
  });
}
