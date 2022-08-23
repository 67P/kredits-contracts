const { ethers, upgrades } = require("hardhat");
const path = require("path");
const fileInject = require("./helpers/file_inject.js");

function handleError(error) {
  console.error(error.message);
  process.exit(1);
}

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  const networkId = network.chainId;
  console.log(`Deploying to network #${networkId}`);

  const contractFactories = {};
  const contracts = {};

  contractFactories.Contributor   = await ethers.getContractFactory("Contributor");
  contractFactories.Contribution  = await ethers.getContractFactory("Contribution");
  contractFactories.Token         = await ethers.getContractFactory("Token");
  contractFactories.Reimbursement = await ethers.getContractFactory("Reimbursement");

  async function deployContractProxy (contractName, params=[]) {
    let contract = await upgrades.deployProxy(contractFactories[contractName], params)
                                 .catch(handleError);

    contracts[contractName] = contract;

    await contract.deployed().then(() => {
      console.log(`${contractName} deployed to:`, contract.address);
      console.log("...waiting for 1 confirmation");
    }).catch(handleError);

    await contract.deployTransaction.wait().catch(handleError);
  }

  const blocksVetoPeriod = 40320; // 7 days; 15 seconds block time

  await deployContractProxy('Contributor');
  await deployContractProxy('Contribution', [ blocksVetoPeriod ]);
  await deployContractProxy('Token');
  await deployContractProxy('Reimbursement');

  console.log('Calling Contributor#setTokenContract')
  await contracts.Contributor.functions
    .setTokenContract(contracts.Token.address)
    .then(res => {
      console.log(`...transaction published: ${res.hash}`);
      return res.wait();
    }).catch(handleError);

  console.log('Calling Contributor#setContributionContract')
  await contracts.Contributor.functions
    .setContributionContract(contracts.Contribution.address)
    .then(res => {
      console.log(`...transaction published: ${res.hash}`);
      return res.wait();
    }).catch(handleError);


  console.log('Calling Contribution#setTokenContract')
  await contracts.Contribution.functions
    .setTokenContract(contracts.Token.address)
    .then(res => {
      console.log(`...transaction published: ${res.hash}`);
      return res.wait();
    }).catch(handleError);


  console.log('Calling Contribution#setContributorContract')
  await contracts.Contribution.functions
    .setContributorContract(contracts.Contributor.address)
    .then(res => {
      console.log(`...transaction published: ${res.hash}`);
      return res.wait();
    }).catch(handleError);

  console.log('Calling Token#setContributionContract')
  await contracts.Token.functions
    .setContributionContract(contracts.Contribution.address)
    .then(res => {
      console.log(`...transaction published: ${res.hash}`);
      return res.wait();
    }).catch(handleError);

  console.log('Calling Token#setContributorContract')
  await contracts.Token.functions
    .setContributorContract(contracts.Contributor.address)
    .then(res => {
      console.log(`...transaction published: ${res.hash}`);
      return res.wait();
    }).catch(handleError);

  console.log('Calling Reimbursement#setContributorContract')
  await contracts.Reimbursement.functions
    .setContributorContract(contracts.Contributor.address)
    .then(res => {
      console.log(`...transaction published: ${res.hash}`);
      return res.wait();
    }).catch(handleError);

  const addresses = {
    Contributor: contracts.Contributor.address,
    Contribution: contracts.Contribution.address,
    Token: contracts.Token.address,
    Reimbursement: contracts.Reimbursement.address,
  };

  console.log("Writing addresses.json");
  const libPath = path.join(__dirname, "..", "lib");
  fileInject(path.join(libPath, "addresses.json"), networkId, addresses);
  console.log("DONE!");
}

main();
