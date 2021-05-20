const promptly = require('promptly');
const EthDater = require('ethereum-block-by-date');
const initKredits = require('./helpers/init_kredits.js');

module.exports = async function(callback) {
  let kredits;
  try { kredits = await initKredits(web3); } catch(e) { callback(e); return; }

  const dater     = new EthDater(kredits.provider);
  const dateStr   = await promptly.prompt('Specify a date and time (e.g. 2021-05-07T14:00:40Z): ');
  const blockData = await dater.getDate(dateStr, true);

  console.log(`
The closest block is #${blockData.block}:
https://rinkeby.etherscan.io/block/${blockData.block}
`);

  callback();
}
