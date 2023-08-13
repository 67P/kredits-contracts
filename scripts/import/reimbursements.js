const fs = require('fs');
const Kredits = require('../../lib/kredits');

async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner())
  await kredits.init();

  console.log(`Using Reimbursement at: ${kredits.Reimbursement.contract.address}`);
  const count = await kredits.Reimbursement.count;
  console.log(`Currently ${count} entries`);
  try {
    const data = fs.readFileSync("./data/reimbursements.json");
    const reimbursements = JSON.parse(data);
    const ids = Object.keys(reimbursements)
      .map(k => parseInt(k))
      .sort(function(a, b) { return a - b });

    for (const reimbursementId of ids) {
      const reimbursement = reimbursements[reimbursementId.toString()];
      const result = await kredits.Reimbursement.contract.add(
        reimbursement.amount,
        reimbursement.token,
        reimbursement.recipientId,
        reimbursement.hashDigest,
        reimbursement.hashFunction,
        reimbursement.hashSize,
      );
      console.log(`Adding reimbursement #${reimbursementId}: ${result.hash}`);
      await result.wait();
    };
  } catch (e) {
    console.error(e);
  }
}

main();
