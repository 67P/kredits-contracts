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
    head: ['ID', 'Name', 'Kredits']
  })

  try {
    let currentBlockNumber = await kredits.provider.getBlockNumber();
    console.log(`Current block number: ${currentBlockNumber}`);

    let confirmedBeforeBlock = await promptly.prompt('Before block: ');
    let confirmedAfterBlock = await promptly.prompt('After block: ');

    let tokens = {};
    let contributors = await kredits.Contributor.all();
    contributors.forEach(c => {
      tokens[c.id] = { amount: 0, contributor: c };
    });

    let contributionId = await kredits.Contribution.contract.contributionsCount();
    let nextContribution = true;

    while (nextContribution) {
      console.log(`Getting contribution: ${contributionId}`);
      let contribution = await kredits.Contribution.getById(contributionId);
      contributionId = contributionId - 1;

      // if no conribution is found
      if (!contribution.exists) {
        nextContribution = false;
        break;
      }
      // check if the contribution is older
      // in that case we assume all other contributions now are older
      if (contribution.confirmedAtBlock < confirmedAfterBlock) {
        nextContribution = false;
      }

      // if the contribution is within the range count it
      if (!contribution.vetoed && contribution.confirmedAtBlock < confirmedBeforeBlock && contribution.confirmedAtBlock > confirmedAfterBlock) {
        // init
        tokens[contribution.contributorId].amount = tokens[contribution.contributorId].amount + contribution.amount;
      }
    }

    Object.keys(tokens).forEach((contributorId) => {
      table.push([
        contributorId,
        `${tokens[contributorId].contributor.name}`,
        `${tokens[contributorId].amount}`
      ]);
    });

    const total = Object.keys(tokens).map(cid => { return tokens[cid].amount}).reduce((a,b) => { return a+b }, 0);
    console.log(`Total confirmed Kredits: ${total} between block ${confirmedAfterBlock} and ${confirmedBeforeBlock}`);
    console.log(table.toString());
  } catch (err) {
    console.log(err);
  }

  callback();
}
