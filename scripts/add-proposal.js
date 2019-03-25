const promptly = require('promptly');

const ethers = require('ethers');
const Kredits = require('../lib/kredits');

const getNetworkId = require('./helpers/networkid.js')

module.exports = async function(callback) {
  const networkId = await getNetworkId(web3)
  const provider = new ethers.providers.Web3Provider(
    web3.currentProvider, { chainId: parseInt(networkId) }
  );
  const kredits = await new Kredits(provider, provider.getSigner()).init();

  console.log(`Using Proposal at: ${kredits.Proposal.contract.address}`);

  let contributor = await promptly.prompt('Contributor (address or id): ');
  let contributorId;
  let contributorAccount;
  if (contributor.length < 5) {
    contributorId = contributor;
    contributorAccount = await kredits.Contributor.functions.getContributorAddressById(contributor);
  } else {
    contributorAccount = contributor;
    contributorId = await kredits.Contributor.functions.getContributorIdByAddress(contributor);
  }
  console.log(`Creating a proposal for contributor ID #${contributorId} account: ${contributorAccount}`);

  let contributionAttributes = {
    contributorId,
    amount: await promptly.prompt('Amount: '),
    description: await promptly.prompt('Description: '),
    kind: await promptly.prompt('Kind: ', { default: 'dev' }),
    url: await promptly.prompt('URL: ', { default: '' })
  }

  console.log("\nAdding proposal:");
  console.log(contributionAttributes);

  kredits.Proposal.addProposal(contributionAttributes, { gasLimit: 300000 }).then((result) => {
    console.log("\n\nResult:");
    console.log(result);
    callback();
  }).catch((error) => {
    console.log('Failed to create proposal');
    callback(error);
  });
}
