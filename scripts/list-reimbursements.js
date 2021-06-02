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

  console.log(`Using Reimbursement at: ${kredits.Reimbursement.contract.address}`);

  const table = new Table({
    head: ['ID', 'Amount', 'Token', 'recipientId', 'Confirmed?', 'Vetoed?', 'IPFS', 'Expenses']
  })

  try {
    let blockNumber = await kredits.provider.getBlockNumber();
    let reimbursements = await kredits.Reimbursement.all({page: {size: 1000}});

    let kreditsSum = 0;
    console.log(`Current block number: ${blockNumber}`);
    reimbursements.forEach(r => {
      const confirmed = r.confirmedAtBlock <= blockNumber;

      table.push([
        r.id.toString(),
        r.amount.toString(),
        `${r.token}`,
        `${r.recipientId}`,
        `${confirmed}`,
        `${r.vetoed}`,
        `${r.ipfsHash}`,
        `${r.expenses.length}`
      ]);
    });

    console.log(table.toString());

    let totalAmountUnconfirmed = await kredits.Reimbursement.functions.totalAmount(false);
    let totalAmountConfirmed = await kredits.Reimbursement.functions.totalAmount(true);
    console.log(`Total: ${totalAmountConfirmed} (confirmed) | ${totalAmountUnconfirmed} (including unconfirmed)`);
  } catch (err) {
    console.log(err);
  }

  callback();
}
