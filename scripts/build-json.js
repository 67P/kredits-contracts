const fs = require('fs');
const path = require('path');

const contractsPath = path.join(__dirname, '..', 'build', 'contracts');
const libPath = path.join(__dirname, '..', 'lib');
const abisPath = path.join(libPath, 'abis');
const addressesPath = path.join(libPath, 'addresses');

const files = [
  'Contributors',
  'Contribution',
  'Operator',
  'Registry',
  'Token'
];

files.forEach((fileName) => {
  let file = require(`${contractsPath}/${fileName}.json`);
  let abiFile = path.join(abisPath, `${fileName}.json`);
  fs.writeFileSync(abiFile, JSON.stringify(file.abi));

  if (fileName === 'Registry') {
    let addresseFile = path.join(addressesPath, `${fileName}.json`);
    let content = fs.readFileSync(addresseFile);
    let addresses = Object.keys(file.networks)
      .reduce((addresses, key) => {
        addresses[key] = file.networks[key].address;
        return addresses;
      }, JSON.parse(content));
    fs.writeFileSync(addresseFile, JSON.stringify(addresses));
  }
});

console.log("Don't forget to reaload the JSON files from your application; i.e. restart kredits-web");
