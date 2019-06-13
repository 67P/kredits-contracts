const path = require('path');
const each = require('async-each-series');
const ethers = require('ethers');

const initKredits = require('./helpers/init_kredits.js');
const seeds = require(path.join(__dirname, '..', '/config/seeds.js'));

module.exports = async function(callback) {
  let kredits;
  try {
    kredits = await initKredits(web3);
  } catch(e) {
    callback(e);
    return;
  }

  let fundingAmount = 2;
  each(seeds.funds, (address, next) => {
    console.log(`funding ${address} with 2 ETH`);
    try {
      web3.eth.sendTransaction({
        to: address,
        value: web3.toWei(fundingAmount),
        from: web3.eth.accounts[0]
      }, result => next())
    } catch(e) {
      console.log('FAILED:', e);
    }
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
      console.log(`[FAILED] kredits.${contractName}.${method}(${JSON.stringify(args)})`);
      console.log(`Error: ${error.message}`);
      next();
    });
  }, () => { console.log("\nDone!") });

}
