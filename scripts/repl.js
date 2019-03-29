const REPL = require('repl');

const initKredits = require('./helpers/init_kredits.js');

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
  let kredits;
  try {
    kredits = await initKredits(web3);
  } catch(e) {
    callback(e);
    return;
  }

  console.log(`Defined variables: kredits, web3`);
  let r = REPL.start();
  r.context.kredits = kredits;
  r.context.web3 = web3;
  r.eval = promiseEval(r);

  r.on('exit', () => {
    console.log('Bye');
    callback();
  });
}
