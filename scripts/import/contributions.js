const fs = require('fs');
const Kredits = require('../../lib/kredits');

const PARALLEL_TXS = 5;

async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner())
  await kredits.init();

  console.log(`Using Contribution at: ${kredits.Contribution.contract.address}`);

  try {
    const data = fs.readFileSync("./data/contributions.json");
    const contributions = JSON.parse(data);
    const ids = Object.keys(contributions)
                      .map(k => parseInt(k))
                      .sort(function(a, b){return a-b});

    const currentBlockHeight = await kredits.provider.getBlockNumber();
    const confirmationPeriod = 40320 // blocks
    const unconfirmedHeight = currentBlockHeight + confirmationPeriod;

    const txBundlesAmount = Math.ceil(ids.length / PARALLEL_TXS);
    let txBundles = [];

    for (let i = 0; i < txBundlesAmount; i++) {
      txBundles.push(ids.slice((i * PARALLEL_TXS), (i * PARALLEL_TXS) + PARALLEL_TXS));
    }

    for (const txBundle of txBundles) {
      console.log(`Adding contributions #${txBundle[0]} to #${txBundle[txBundle.length - 1]}`)

      let resultPromises = [];

      for (const contributionId of txBundle) {
        const c = contributions[contributionId.toString()];

        const confirmedAtBlock = c.confirmed ? currentBlockHeight : unconfirmedHeight;

        const result = await kredits.Contribution.contract.add(
          c.amount, c.contributorId,
          c.hashDigest, c.hashFunction, c.hashSize,
          confirmedAtBlock, c.vetoed
        );

        resultPromises.push(result.wait());

        console.log(`Added contribution #${contributionId}: ${result.hash}`);
      }

      console.log(`Waiting for confirmations...`);

      await Promise.all(resultPromises);

      console.log('Transactions confirmed');
    }
  } catch(e) {
    console.log(e);
  }
}

main();
