const fs = require('fs');
const Kredits = require('../../lib/kredits');

async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner())
  await kredits.init();

  console.log(`Using Contribution at: ${kredits.Contribution.contract.address}`);
  const count = await kredits.Contribution.count;
  console.log(`Currently ${count} entries`);

  try {
    const data = fs.readFileSync("./data/contributions.json");
    const contributions = JSON.parse(data);
    const ids = Object.keys(contributions)
                      .map(k => parseInt(k))
                      .sort(function(a, b){return a-b});

    const currentBlockHeight = await kredits.provider.getBlockNumber();
    const confirmationPeriod = 40320 // blocks
    const unconfirmedHeight = currentBlockHeight + confirmationPeriod;

    for (const contributionId of ids) {
      const c = contributions[contributionId.toString()];

      const confirmedAtBlock = c.confirmed ? currentBlockHeight : unconfirmedHeight;

      const result = await kredits.Contribution.contract.add(
        c.amount, c.contributorId,
        c.hashDigest, c.hashFunction, c.hashSize,
        confirmedAtBlock, c.vetoed
      );
      console.log(`Adding contribution #${contributionId}: ${result.hash}`);
      await result.wait();
    };
  } catch(e) {
    console.error(e);
  }
}

main();
