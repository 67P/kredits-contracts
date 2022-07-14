const promptly = require('promptly');
const { inspect } = require('util');

const { ethers } = require("hardhat");
const Kredits = require('../lib/kredits');

async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner())
  await kredits.init();

  console.log(`Using Contributions at: ${kredits.Contribution.contract.address}\n`);

  let contributionId = await promptly.prompt('Contribution ID: ');

  console.log(`Recording a veto for contribution #${contributionId}`);

  kredits.Contribution.contract.veto(contributionId, { gasLimit: 300000 })
    .then(result => {
      console.log("\n\nResult:");
      console.log(result);
      callback();
    })
    .catch(error => {
      console.log('Failed to veto contribution');
      callback(inspect(error));
    });
}

main();
