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
