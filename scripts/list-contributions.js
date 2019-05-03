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

    console.log(`Current block number: ${blockNumber}`);
    contributions.forEach((c) => {
      if (!c.exists) { return; } // if there are zero contributions we currently get an empty one
      const confirmed = c.confirmedAtBlock <= blockNumber;

      table.push([
        c.id.toString(),
        c.contributorId,
        `${c.description}`,
        c.amount.toString(),
        `${confirmed} (${c.confirmedAtBlock})`,
        c.vetoed,
        c.claimed,
        c.ipfsHash
      ])
    });

    console.log(table.toString());

    let totalKreditsEarned = await kredits.Contribution.functions.totalKreditsEarned(true);
    console.log(`Total confirmed kredits: ${totalKreditsEarned}`);
  } catch (err) {
    console.log(err);
  }

  callback();
}
