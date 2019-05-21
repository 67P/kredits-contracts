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

  let recipient = await promptly.prompt('Contributor ID: ');
  recipient = parseInt(recipient);

  const table = new Table({
    head: ['ID', 'Description', 'Amount', 'Claim Transaction'],
  });

  try {
    let blockNumber = await kredits.provider.getBlockNumber();
    let contributions = await kredits.Contribution.all({page: {size: 200}});

    console.log(`Current block number: ${blockNumber}`);
    let claimPromises = contributions.map(async (c) => {
      const confirmed = c.confirmedAtBlock <= blockNumber;

      if (c.contributorId === recipient && confirmed && !c.vetoed && !c.claimed) {
        console.log(`Claiming contribution ID=${c.id}`);
        return kredits.Contribution.functions.claim(c.id, { gasLimit: 500000 }).then(tx => {
          table.push([
            c.id.toString(),
            `${c.description}`,
            c.amount.toString(),
            tx.hash,
          ]);
        });
      }
    });

    Promise.all(claimPromises).then(_ => {
      console.log(table.toString());
      callback();
    });
  } catch (err) {
    console.log(err);
    callback();
  }
};
