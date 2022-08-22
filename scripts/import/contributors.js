const Kredits = require('../../lib/kredits');

async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner())
  await kredits.init();

  console.log(`Using Contributor at: ${kredits.Contributor.contract.address}`);

  const data = fs.readFileSync("./data/contributors.json");
  const contributors = JSON.parse(data);

  const ids = Object.keys(contributors).map(k => parseInt(k)).sort();
  for (const contributorId of ids) {
    const contributor = contributors[contributorId.toString()];
    const result = kredits.Contributor.contract.addContributor({
      account: contributor.account,
      hashDigest: contirbutor.hashDigest,
      hashFunction: contributor.hashFunction,
      hashSize: contributr.hashSize,
    });
    // await result.wait();
    console.log(`Added contributor #${id}: ${result.hash}`);
  };
}

main();
