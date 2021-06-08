const promptly = require('promptly');
const Table = require('cli-table');

const { ethers } = require("hardhat");
const Kredits = require('../lib/kredits');

async function main() {
  let kredits;
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner())
  await kredits.init();

  console.log(`Using Contribution at: ${kredits.Contribution.contract.address}`);

  const table = new Table({
    head: ['ID', 'Contributor ID', 'Description', 'Amount', 'Confirmed?', 'Vetoed?', 'Claimed?', 'IPFS']
  })

  try {
    let blockNumber = await kredits.provider.getBlockNumber();
    let contributions = await kredits.Contribution.all({page: {size: 1000}});

    let kreditsSum = 0;
    console.log(`Current block number: ${blockNumber}`);
    contributions.forEach((c) => {
      const confirmed = c.confirmedAtBlock <= blockNumber;

      table.push([
        c.id.toString(),
        c.contributorId,
        `${c.description}`,
        c.amount.toString(),
        `${confirmed} (${c.confirmedAtBlock})`,
        c.vetoed,
        c.claimed,
        c.ipfsHash
      ])
    });

    console.log(table.toString());

    let totalKreditsEarnedUnConfirmed = await kredits.Contribution.contract.totalKreditsEarned(false);
    let totalKreditsEarnedConfirmed = await kredits.Contribution.contract.totalKreditsEarned(true);
    console.log(`Total Kredits: ${totalKreditsEarnedConfirmed} (confirmed) | ${totalKreditsEarnedUnConfirmed} (including unconfirmed)`);
  } catch (err) {
    console.log(err);
  }
}

main();
