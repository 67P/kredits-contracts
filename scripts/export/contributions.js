const fs = require('fs');
const initKredits = require('../helpers/init_kredits.js');

module.exports = async function(callback) {
  let kredits;
  try {
    kredits = await initKredits(web3);
  } catch(e) {
    callback(e);
    return;
  }

  console.log(`Using Contribution at: ${kredits.Contribution.contract.address}`);

  try {
    const count = await kredits.Contribution.count;
    const currentBlockHeight = await kredits.provider.getBlockNumber();

    const backup = {};
    const promises = [];
    for (let i = 1; i <= count; i++) {
      promises.push(new Promise((resolve, reject) => {
        setTimeout(async () => {
          console.log(`Loading contribution #${i}`);
          await kredits.Contribution.contract.getContribution(i).then(contractData => {
            backup[i] = {
              amount: contractData.amount,
              contributorId: contractData.contributorId,
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
      fs.writeFileSync("./data/contributions.json", JSON.stringify(backup, null, 2));
      console.log("Exported");
    });
  } catch(e) {
    callback(e);
    return;
  }

  callback();
}
