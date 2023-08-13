const fs = require('fs');
const Kredits = require('../../lib/kredits');

async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner())
  await kredits.init();

  console.log(`Using Reimbursement at: ${kredits.Reimbursement.contract.address}`);

  const count = await kredits.Reimbursement.count;
  const currentBlockHeight = await hre.ethers.provider.getBlockNumber();

  const backup = {};
  const promises = [];
  for (let i = 1; i <= count; i++) {
    promises.push(new Promise((resolve, reject) => {
      setTimeout(async () => {
        console.log(`Loading reimbursement #${i}`);
        await kredits.Reimbursement.contract.get(i).then(contractData => {
          backup[i] = {
            recipientId: contractData.recipientId,
            amount: contractData.amount,
            token: contractData.token,
            hashDigest: contractData.hashDigest,
            hashFunction: contractData.hashFunction,
            hashSize: contractData.hashSize,
            confirmedAtBlock: contractData.confirmedAtBlock,
            confirmed: contractData.confirmedAtBlock <= currentBlockHeight,
            vetoed: contractData.vetoed,
            id: contractData.id,
          }
          resolve();
        });
      }, 100 * i);
    }));
  }

  await Promise.all(promises).then(() => {
    fs.writeFileSync("./data/reimbursements.json", JSON.stringify(backup, null, 2));
    console.log("Exported");
  });
}

main();
