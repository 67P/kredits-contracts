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

  console.log(`Using Contributor at: ${kredits.Contributor.contract.address}`);

  try {
    const count = await kredits.Contributor.count;

    const backup = {};
    const promises = [];
    for (let i = 1; i <= count; i++) {
      promises.push(new Promise((resolve, reject) => {
        setTimeout(async () => {
          console.log(`Loading contributor #${i}`);
          await kredits.Contributor.contract.getContributorById(i).then(contractData => {
            backup[i] = {
              account: contractData.account,
              hashDigest: contractData.hashDigest,
              hashFunction: contractData.hashFunction,
              hashSize: contractData.hashSize,
              id: contractData.id,
            }
            resolve();
          });
        }, 100 * i);
      }));
    }

    await Promise.all(promises).then(() => {
      fs.writeFileSync("./data/contributors.json", JSON.stringify(backup, null, 2));
      console.log("Exported");
    });
  } catch(e) {
    callback(e);
    return;
  }

  callback();
}
