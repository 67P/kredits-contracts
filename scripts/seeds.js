const path = require("path");
const colors = require('colors/safe');
const Kredits = require("../lib/kredits");
const seeds = require(path.join(__dirname, "..", "/config/seeds.js"));

let somethingFailed = false;

async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner());
  await kredits.init();

  const address = await hre.ethers.provider.getSigner().getAddress();
  console.log(`Sender account: ${address}\n`);

  let fundingAmount = "2";

  for (const address of seeds.funds) {
    console.log(`Funding ${address} with 2 ETH`);

    try {
      await hre.ethers.provider.getSigner().sendTransaction({
        to: address,
        value: hre.ethers.utils.parseEther(fundingAmount),
      });
      console.log(colors.green('Done'));
    } catch (e) {
      somethingFailed = true;
      console.log(colors.red("FAILED:", e));
    }
  }

  console.log(`\nRunning seeds (${seeds.contractCalls.length} contract calls)...\n`)

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
        `${colors.green('[OK]')} kredits.${contractName}.${method}(${JSON.stringify(
          args
        )}) => ${result.hash}`
      );
    } catch(error) {
      somethingFailed = true;
      console.log(
        `${colors.red('[FAILED]')} kredits.${contractName}.${method}(${JSON.stringify(args)})`
      );
      console.log(`Reason: ${error.message}`);
    }
  }
}

main().then(() => {
  if (somethingFailed) {
    console.log("\nSomething went wrong while running the seeds. Please check the log output above.");
  } else {
    console.log("\nBravo, all done!");
  }
});
