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

  console.log(`Using Contribution at: ${kredits.Contribution.contract.address}`);


  const table = new Table({
    head: ['ID', 'Contributor account', 'Amount', 'Claimed?', 'Vetoed?', 'Description']
  })

  let contributions = await kredits.Contribution.all()

  contributions.forEach((c) => {
    table.push([
      c.id.toString(),
      c.contributor,
      c.amount.toString(),
      c.claimed,
      c.vetoed,
      `${c.description}`
    ])
  })
  console.log(table.toString())
  callback()
}
