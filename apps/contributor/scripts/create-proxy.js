const { ethers, upgrades } = require("hardhat");

async function main() {
  const Contributor = await ethers.getContractFactory("Contributor");
  const contributor = await upgrades.deployProxy(Contributor, []);
  await contributor.deployed();
  console.log("Contributor deployed to:", contributor.address);
}

main();
