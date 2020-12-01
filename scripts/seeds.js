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
      web3.eth.personal.getAccounts().then(accounts => {
        web3.eth.personal.sendTransaction({
          to: address,
          from: accounts[0],
          value: web3.utils.toWei(new web3.utils.BN(fundingAmount))
        });
      });
    } catch(e) {
      console.log('FAILED:', e);
    }
    next();
  });

  each(seeds.contractCalls, (call, next) => {
    let [contractName, method, args] = call;
    let contractWrapper = kredits[contractName];
    let func;
    if (contractWrapper[method]) {
      func = contractWrapper[method];
    } else {
      func = contractWrapper.contract[method];
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
