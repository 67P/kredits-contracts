const promptly = require('promptly');
const Table = require('cli-table');

const { ethers } = require("hardhat");
const Kredits = require('../lib/kredits');

async function main() {
  let kredits;
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner())
  await kredits.init();

  console.log(`Using Contributor at: ${kredits.Contributor.contract.address}`);

  const table = new Table({
    head: ['ID', 'Account', 'Name', 'Core?', 'Balance', 'Kredits earned', 'Contributions count', 'IPFS']
  })

  const contributors = await kredits.Contributor.all()

  contributors.forEach((c) => {
    table.push([
      c.id.toString(),
      c.account,
      `${c.name}`,
      c.isCore,
      c.balanceInt.toString(),
      c.totalKreditsEarned.toString(),
      c.contributionsCount.toString(),
      c.ipfsHash
    ])
  });

  console.log(table.toString());
}

main();
