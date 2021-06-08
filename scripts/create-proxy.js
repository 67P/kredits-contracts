const { ethers, upgrades } = require("hardhat");

const path = require('path');
const fileInject = require('./helpers/file_inject.js');

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

  const blocksToWait = 40320; // 7 days; 15 seconds block time
  const contribution = await upgrades.deployProxy(Contribution, [blocksToWait]);
  await contribution.deployed();
  console.log("Contribution deployed to:", contribution.address);

  const token = await upgrades.deployProxy(Token, []);
  await token.deployed();
  console.log("Token deployed to:", token.address);

  const reimbursement = await upgrades.deployProxy(Reimbursement, []);
  await reimbursement.deployed();
  console.log("Reimbursement deployed to:", reimbursement.address);

  await contributor.setTokenContract(token.address);
  await contributor.setContributionContract(contribution.address);

  await contribution.setTokenContract(token.address);
  await contribution.setContributorContract(contributor.address);

  const c = await contributor.contributionContract();
  console.log(c);

  const addresses = {
    Contributor: contributor.address,
    Contribution: contribution.address,
    Token: token.address,
    Reimbursement: reimbursement.address
  };

  const libPath = path.join(__dirname, '..', 'lib');
  fileInject(path.join(libPath, 'addresses.json'), networkId, addresses);
}

main();
