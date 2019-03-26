module.exports = function(web3) {
  return new Promise((resolve, reject) => {
    web3.version.getNetwork((err, network) => {
      if (err) {
        reject(err);
      } else {
        resolve(network);
      }
    })
  })
}
