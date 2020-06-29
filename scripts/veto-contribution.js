const promptly = require('promptly');
const { inspect } = require('util');

const initKredits = require('./helpers/init_kredits.js');

module.exports = async function(callback) {
  let kredits;
  try { kredits = await initKredits(web3);
  } catch(e) { callback(e); return; }

  console.log(`Using Contributions at: ${kredits.Contribution.contract.address}\n`);

  let contributionId = await promptly.prompt('Contribution ID: ');

  console.log(`Recording a veto for contribution #${contributionId}`);

  try {
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
  } catch(err) {
    console.log('Failed to veto contribution');
    callback(inspect(err));
  }
}
