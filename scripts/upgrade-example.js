const { ethers, upgrades } = require("hardhat");
const Kredits = require('../lib/kredits');

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner());
  await kredits.init();

  const ContributorV2 = await ethers.getContractFactory("Contributor");
  const contributor = await upgrades.upgradeProxy(kredits.Contributor.address, ContributorV2);
  console.log("Contributor upgraded");
  console.log(`Contirbutor address: ${contributor.address}`);

  await contributor.deployTransaction.wait();

  console.log("DONE!");
}

main();
