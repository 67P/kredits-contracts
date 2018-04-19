const promptly = require('promptly');

module.exports = async function(callback) {
  let recipient = await promptly.prompt('Recipient address: ');
  let amount = await promptly.prompt('Amount: ', {default: '1'});
  amount = parseInt(amount);

  console.log(`sending ${amount} ETH from ${web3.eth.accounts[0]} to ${recipient}`);

  web3.eth.sendTransaction({to: recipient, value: web3.toWei(amount), from: web3.eth.accounts[0]}, console.log);

  callback();
}
