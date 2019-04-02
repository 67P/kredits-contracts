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
