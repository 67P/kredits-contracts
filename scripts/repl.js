const REPL = require('repl');

const ethers = require('ethers');
const Kredits = require('../lib/kredits');

module.exports = function(callback) {
  const networkId = parseInt(web3.version.network);
  const provider = new ethers.providers.Web3Provider(
    web3.currentProvider, { chainId: networkId }
  );

  new Kredits(provider, provider.getSigner()).init().then((kredits) => {
    console.log(`Defined variables: kredits, web3`);
    let r = REPL.start();
    r.context.kredits = kredits;
    r.context.web3 = web3;

    r.on('exit', () => {
      console.log('Bye');
      callback();
    });
  });
}
