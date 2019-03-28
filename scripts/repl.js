const REPL = require('repl');

const ethers = require('ethers');
const Kredits = require('../lib/kredits');

const getNetworkId = require('./helpers/networkid.js')

function promiseEval (repl) {
  const currentEval = repl.eval;
  return function (cmd, context, filename, callback) {
    currentEval(cmd, context, filename, (err, result) => {
      if (result && typeof result.then === 'function') {
        console.log('...waiting for promise to resolve');
        return result
          .then(response => callback(null, response))
          .catch(err => callback(err, null));
      }
      return callback(err, result);
    })
  }
}

module.exports = async function(callback) {
  const networkId = await getNetworkId(web3)
  const provider = new ethers.providers.Web3Provider(
    web3.currentProvider, { chainId: parseInt(networkId) }
  );

  new Kredits(provider, provider.getSigner()).init().then((kredits) => {
    console.log(`Defined variables: kredits, web3`);
    let r = REPL.start();
    r.context.kredits = kredits;
    r.context.web3 = web3;
    r.eval = promiseEval(r);

    r.on('exit', () => {
      console.log('Bye');
      callback();
    });
  });
}
