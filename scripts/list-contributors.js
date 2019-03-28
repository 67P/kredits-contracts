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

  console.log(`Using Contributor at: ${kredits.Contributor.contract.address}`);


  const table = new Table({
    head: ['ID', 'Account', 'Core?', 'Name']
  })

  let contributors = await kredits.Contributor.all()

  contributors.forEach((c) => {
    table.push([
      c.id.toString(),
      c.account,
      c.isCore,
      `${c.name}`
    ])
  })
  console.log(table.toString())
  callback()
}

