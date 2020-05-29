const fs = require('fs');
const path = require('path');

const contractsPath = path.join(__dirname, '..', 'build', 'contracts');
const libPath = path.join(__dirname, '..', 'lib');
const abisPath = path.join(libPath, 'abis');

const files = [
  'Contributor',
  'Contribution',
  'Kernel',
  'Proposal',
  'Token',
  'Reimbursement',
  'ACL'
];

files.forEach((fileName) => {
  let file = require(`${contractsPath}/${fileName}.json`);
  let abiFile = path.join(abisPath, `${fileName}.json`);
  fs.writeFileSync(abiFile, JSON.stringify(file.abi));
});

console.log("Don't forget to reaload the JSON files from your application; i.e. restart kredits-web");
