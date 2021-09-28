const path = require("path");
const each = require("async-each-series");

const seeds = require(path.join(__dirname, "..", "/config/seeds.js"));

const { ethers } = require("hardhat");
const Kredits = require("../lib/kredits");

async function main() {
  kredits = new Kredits(hre.ethers.provider, hre.ethers.provider.getSigner());
  await kredits.init();

  const address = await hre.ethers.provider.getSigner().getAddress();
  console.log(`Sender account: ${address}`);

  let fundingAmount = "2";
  each(seeds.funds, (address, next) => {
    console.log(`funding ${address} with 2 ETH`);
    try {
      hre.ethers.provider.getSigner().sendTransaction({
        to: address,
        value: hre.ethers.utils.parseEther(fundingAmount),
      });
    } catch (e) {
      console.log("FAILED:", e);
    }
    next();
  });

  each(
    seeds.contractCalls,
    (call, next) => {
      let [contractName, method, args] = call;
      let contractWrapper = kredits[contractName];
      let func;
      if (contractWrapper[method]) {
        func = contractWrapper[method];
      } else {
        func = contractWrapper.contract[method];
      }
      func
        .apply(contractWrapper, args)
        .then((result) => {
          console.log(
            `[OK] kredits.${contractName}.${method}(${JSON.stringify(
              args
            )}) => ${result.hash}`
          );
          result.wait().then((r) => {
            next();
          });
        })
        .catch((error) => {
          console.log(
            `[FAILED] kredits.${contractName}.${method}(${JSON.stringify(
              args
            )})`
          );
          console.log(`Error: ${error.message}`);
          next();
        });
    },
    () => {
      console.log("\nDone!");
    }
  );
}

main();
