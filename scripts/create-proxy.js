const { ethers, upgrades } = require("hardhat");

const path = require("path");
const fileInject = require("./helpers/file_inject.js");

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  const networkId = network.chainId;
  console.log(`Deploying to network #${networkId}`);

  const Contributor = await ethers.getContractFactory("Contributor");
  const Contribution = await ethers.getContractFactory("Contribution");
  const Token = await ethers.getContractFactory("Token");
  const Reimbursement = await ethers.getContractFactory("Reimbursement");

  const contributor = await upgrades.deployProxy(Contributor, []);
  await contributor.deployed();
  console.log("Contributor deployed to:", contributor.address);
  console.log("...waiting for 1 confirmation");
  await contributor.deployTransaction.wait();

  const blocksToWait = 40320; // 7 days; 15 seconds block time
  const contribution = await upgrades.deployProxy(Contribution, [blocksToWait]);
  await contribution.deployed();
  console.log("Contribution deployed to:", contribution.address);
  console.log("...waiting for 1 confirmation");
  await contribution.deployTransaction.wait();

  const token = await upgrades.deployProxy(Token, []);
  await token.deployed();
  console.log("Token deployed to:", token.address);
  console.log("...waiting for 1 confirmation");
  await token.deployTransaction.wait();

  const reimbursement = await upgrades.deployProxy(Reimbursement, []);
  await reimbursement.deployed();
  console.log("Reimbursement deployed to:", reimbursement.address);
  console.log("...waiting for 1 confirmation");
  await reimbursement.deployTransaction.wait();

  await contributor
    .setTokenContract(token.address)
    .then((response) => response.wait());
  await contributor
    .setContributionContract(contribution.address)
    .then((response) => response.wait());

  await contribution
    .setTokenContract(token.address)
    .then((response) => response.wait());
  await contribution
    .setContributorContract(contributor.address)
    .then((response) => response.wait());

  await token
    .setContributionContract(contribution.address)
    .then((response) => response.wait());
  await token
    .setContributorContract(contributor.address)
    .then((response) => response.wait());

  await reimbursement
    .setContributorContract(contributor.address)
    .then((response) => response.wait());

  const addresses = {
    Contributor: contributor.address,
    Contribution: contribution.address,
    Token: token.address,
    Reimbursement: reimbursement.address,
  };

  console.log("Writing addresses.json");
  const libPath = path.join(__dirname, "..", "lib");
  fileInject(path.join(libPath, "addresses.json"), networkId, addresses);
  console.log("DONE!");
}

main();
