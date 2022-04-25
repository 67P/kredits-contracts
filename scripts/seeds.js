const path = require("path");
const { ethers } = require("hardhat");
const Kredits = require("../lib/kredits");
const seeds = require(path.join(__dirname, "..", "/config/seeds.js"));

async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner());
  await kredits.init();

  const address = await hre.ethers.provider.getSigner().getAddress();
  console.log(`Sender account: ${address}`);

  let fundingAmount = "2";

  for (const address of seeds.funds) {
    console.log(`Funding ${address} with 2 ETH`);

    try {
      await hre.ethers.provider.getSigner().sendTransaction({
        to: address,
        value: hre.ethers.utils.parseEther(fundingAmount),
      });
      console.log('Done');
    } catch (e) {
      console.log("FAILED:", e);
    }
  }

  console.log(`Running seeds (${seeds.contractCalls.length} contract calls)...\n`)

  for (const call of seeds.contractCalls) {
    const [contractName, method, args] = call;
    const contractWrapper = kredits[contractName];
    const func = contractWrapper[method] ?
                 contractWrapper[method] :
                 contractWrapper.contract[method];

    try {
      // console.log('trying', func);
      const result = await func.apply(contractWrapper, args);
      // console.log('result:', result);
      await result.wait();
      console.log(
        `[OK] kredits.${contractName}.${method}(${JSON.stringify(
          args
        )}) => ${result.hash}`
      );
    } catch(error) {
      console.log(
        `[FAILED] kredits.${contractName}.${method}(${JSON.stringify(args)})`
      );
      console.log(`Error: ${error.message}`);
    }
  }
}

main().then(() => console.log("Bravo, all done!"));
