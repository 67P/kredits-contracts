
module.exports = function(callback) {
  let recipient = process.argv[4];
  if (!recipient) {
    console.log('Please provide a recipient address');
    process.exit();
  }
  let amount = parseInt(process.argv[5]) || 1;
  console.log(recipient);
  web3.eth.sendTransaction({to: recipient, value: web3.toWei(amount), from: web3.eth.accounts[0]}, console.log);

  callback();
}
