const fs = require('fs');
const ethers = require('ethers');
const Kredits = require('../../lib/kredits');
const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth_rinkeby');

const arapp = require('../../arapp.json');
const apm = arapp.environments['rinkeby'].apm;

async function main() {
  const kredits = await new Kredits(provider, null, { apm });
  //kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner())
  await kredits.init();

  console.log(`Using Contributor at: ${kredits.Contributor.contract.address}`);

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
}

main();
