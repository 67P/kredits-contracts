const promptly = require('promptly');
const EthDater = require('ethereum-block-by-date');

const { ethers } = require("hardhat");
const Kredits = require('../lib/kredits');

async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner())
  await kredits.init();

  const dater     = new EthDater(kredits.provider);
  const dateStr   = await promptly.prompt('Specify a date and time (e.g. 2021-05-07T14:00:40Z): ');
  const blockData = await dater.getDate(dateStr, true);

  console.log(`
The closest block is #${blockData.block}:
https://rinkeby.etherscan.io/block/${blockData.block}
`);

}

main();
