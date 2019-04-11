const promptly = require('promptly');
const Table = require('cli-table');

const initKredits = require('./helpers/init_kredits.js');

module.exports = async function(callback) {
  let kredits;
  try {
    kredits = await initKredits(web3);
  } catch(e) {
    callback(e);
    return;
  }

  console.log(`Using Contribution at: ${kredits.Contribution.contract.address}`);

  const table = new Table({
    head: ['ID', 'Contributor ID', 'Description', 'Amount', 'Confirmed?', 'Vetoed?', 'Claimed?', 'IPFS']
  })

  try {
    let blockNumber = await kredits.provider.getBlockNumber();
    let contributions = await kredits.Contribution.all();

    contributions.forEach((c) => {
      const confirmed = c.confirmedAtBlock <= blockNumber;

      table.push([
        c.id.toString(),
        c.contributorId,
        `${c.description}`,
        c.amount.toString(),
        confirmed,
        c.vetoed,
        c.claimed,
        c.ipfsHash
      ])
    });

    console.log(table.toString());
  } catch (err) {
    console.log(err);
  }

  callback();
}
