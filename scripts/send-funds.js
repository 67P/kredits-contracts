const promptly = require('promptly');

module.exports = async function(callback) {
  let recipient = await promptly.prompt('Recipient address: ');
  let amount = await promptly.prompt('Amount: ', {default: '1'});
  amount = parseInt(amount);

  const accounts = await web3.eth.personal.getAccounts();
  let fromAccount = accounts[0];
  let fromBalance = await web3.eth.getBalance(fromAccount);
  let recipientBalance = await web3.eth.getBalance(recipient);

  console.log('--------------');
  console.log(`sender account balance ${fromAccount}: ${fromBalance}`);
  console.log(`recipient account balance ${recipient}: ${recipientBalance}`);

  console.log(`\nsending ${amount} ETH from ${accounts[0]} to ${recipient}`);

  let transaction = await web3.eth.sendTransaction({to: recipient, value: web3.utils.toWei(new web3.utils.BN(amount)), from: accounts[0]});

  console.log(`transaction id: ${transaction.transactionHash}`);

  recipientBalance = await web3.eth.getBalance(recipient);
  console.log(`\nnew recipient account balance ${recipient}: ${recipientBalance}`);

  callback();
}
