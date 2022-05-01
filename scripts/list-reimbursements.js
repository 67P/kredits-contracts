const Table = require("cli-table");
const Kredits = require("../lib/kredits");

async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner());
  await kredits.init();

  console.log(
    `Using Reimbursement at: ${kredits.Reimbursement.contract.address}`
  );

  const table = new Table({
    head: ["ID", "Amount", "Token", "recipientId", "Confirmed?", "Vetoed?", "IPFS", "Expenses"],
  });

  const blockNumber = await kredits.provider.getBlockNumber();
  const reimbursements = await kredits.Reimbursement.all();

  console.log(`Current block number: ${blockNumber}`);

  reimbursements.forEach((r) => {
    const confirmed = r.confirmedAtBlock <= blockNumber;

    table.push([
      r.id.toString(),
      r.amount.toString(),
      `${r.token}`,
      `${r.recipientId}`,
      `${confirmed}`,
      `${r.vetoed}`,
      `${r.ipfsHash}`,
      `${r.expenses.length}`,
    ]);
  });

  console.log(table.toString());

  const totalAmountUnconfirmed = await kredits.Reimbursement.contract.totalAmount(
    false
  );
  const totalAmountConfirmed = await kredits.Reimbursement.contract.totalAmount(
    true
  );
  console.log(
    `Total: ${totalAmountConfirmed} (confirmed) | ${totalAmountUnconfirmed} (including unconfirmed)`
  );
}

main();
