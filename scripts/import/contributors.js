const fs = require('fs');
const Kredits = require('../../lib/kredits');

async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner())
  await kredits.init();

  console.log(`Using Contributor at: ${kredits.Contributor.contract.address}`);

  try {
    const data = fs.readFileSync("./data/contributors.json");
    const contributors = JSON.parse(data);
    const ids = Object.keys(contributors)
                      .map(k => parseInt(k))
                      .sort(function(a, b){return a-b});

    for (const contributorId of ids) {
      const contributor = contributors[contributorId.toString()];
      const result = await kredits.Contributor.contract.addContributor(
        contributor.account,
        contributor.hashDigest,
        contributor.hashFunction,
        contributor.hashSize,
      );
      // await result.wait();
      console.log(`Added contributor #${contributorId}: ${result.hash}`);
    };
  } catch(e) {
    console.log(e);
  }
}

main();
