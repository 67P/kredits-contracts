const path = require('path');
const seeds = require(path.join(__dirname, '..', '/config/seeds.js'));
const IPFS = require('ipfs-api');

var ipfs = IPFS({host: 'localhost', port: '5001', protocol: 'http'})

module.exports = function(callback) {
  const Registry = artifacts.require('./Registry.sol');

  const contracts = {};
  Registry.deployed().then((registry) => {
    Object.keys(seeds.contractCalls).forEach(async (contract) => {
      var address = await registry.getProxyFor(contract);
      console.log(`Using ${contract} at ${address}`);
      contracts[contract] = await artifacts.require(contract).at(address);

      Object.keys(seeds.contractCalls[contract]).forEach((method) => {
        seeds.contractCalls[contract][method].forEach((args) => {
          console.log(`[Sending] ${contract}.#${method}(${JSON.stringify(args)})`);
          contracts[contract][method](...args).then((result) => {
            console.log(`[Result] ${contract}.${method}(${JSON.stringify(args)}) => ${result.tx}`);
          });
        });
      });
    });
  });


  seeds.ipfsContent.forEach((content) => {
    ipfs.add(new ipfs.Buffer(JSON.stringify(content))).then((result) => { console.log(`[IPFS] added ${result[0].hash}`) });
  });
}
