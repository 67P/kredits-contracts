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

    let contributionId = await kredits.Contribution.contract.contributionsCount();
    let nextContribution = true;

    let contributors = {};

    while (nextContribution) {
      console.log(`Getting contribution: ${contributionId}`);
      let contribution = await kredits.Contribution.getById(contributionId);
      contributionId = contributionId - 1;

      // check if the contribution is older
      // in that case we assume all other contributions now are older
      if (contribution.confirmedAtBlock < confirmedAfterBlock) {
        nextContribution = false;
      }

      // if the contribution is within the range count it
      if (!contribution.vetoed && contribution.confirmedAtBlock < confirmedBeforeBlock && contribution.confirmedAtBlock > confirmedAfterBlock) {
        // init
        if (!contributors[contribution.conributorId]) {
          contributors[contribution.contributorId] = 0;
        }
        contributors[contribution.contributorId] += contribution.amount;
      }
    }
    console.log(contributors);
    const promise = Object.keys(contributors).map((contributorId) => {
      return kredits.Contributor.getById(contributorId).then(contributorId => {
        table.push([
          contributorId,
          `${contributor.name}`,
          `${contributors[conributorId]}`
        ]);
      });
    });

    Promise.all(promise).then(() => {
      console.log(`Total Kredits: ${Object.values(contributors).reduce((a,b) => {return a+b},0)}`);
      console.log(table.toString());
    });
  } catch (err) {
    console.log(err);
  }

  callback();
}
