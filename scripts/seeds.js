const path = require('path');
const seeds = require(path.join(__dirname, '..', '/config/seeds.js'));

const ethers = require('ethers');
const Kredits = require('../lib/kredits');

const each = require('async-each-series');

module.exports = async function(callback) {
  const networkId = parseInt(web3.version.network);
  const provider = new ethers.providers.Web3Provider(
    web3.currentProvider, { chainId: networkId }
  );
  const kredits = await new Kredits(provider, provider.getSigner()).init();

  let fundingAmount = 2;
  each(seeds.funds, (address, next) => {
    console.log(`funding ${address} with 2 ETH`);
    web3.eth.sendTransaction({
      to: address,
      value: web3.toWei(fundingAmount),
      from: web3.eth.accounts[0]
    },
    (result) => { next(); }
    )
  });

  each(seeds.contractCalls, (call, next) => {
    let [contractName, method, args] = call;
    let contractWrapper = kredits[contractName];
    let func;
    if (contractWrapper[method]) {
      func = contractWrapper[method];
    } else {
      func = contractWrapper.functions[method];
    }
    func.apply(contractWrapper, args).then((result) => {
      console.log(`[OK] kredits.${contractName}.${method}(${JSON.stringify(args)}) => ${result.hash}`);
      next();
    }).catch((error) => {
      console.log(`[FAILD] kredits.${contractName}.${method}(${JSON.stringify(args)})`);
      callback(error)
    });
  }, () => { console.log("\nDone!") });

}
