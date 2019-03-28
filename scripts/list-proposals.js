const promptly = require('promptly');
const Table = require('cli-table');

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


  const table = new Table({
    head: ['ID', 'Contributor ID', 'Amount', 'Votes', 'Executed?', 'Description']
  })

  let proposals = await kredits.Proposal.all()

  proposals.forEach((p) => {
    table.push([
      p.id.toString(),
      p.contributorId.toString(),
      p.amount.toString(),
      `${p.votesCount.toString()}/${p.votesNeeded.toString()}`,
      p.executed,
      `${p.description}`
    ])
  })
  console.log(table.toString())
  callback()
}
