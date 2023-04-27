const { ethers, upgrades } = require("hardhat");
const Kredits = require('../lib/kredits');

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner());
  await kredits.init();

  const ContributorV2 = await ethers.getContractFactory("Contributor");
  const contributor = await upgrades.upgradeProxy(
    kredits.Contributor.address,
    ContributorV2,
    {
      call: {
        fn: "reinitialize",
        args: [
          "0xc80d2513277FA04B10403E2D1d7dAa86F931f4d1"
        ]
    }
  });
  console.log("Contributor upgraded");
  console.log(`Contributor address: ${contributor.address}`);

  await contributor.deployTransaction.wait();

  console.log("DONE!");
}

main()
