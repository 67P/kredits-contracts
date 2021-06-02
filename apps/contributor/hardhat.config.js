require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy');
require("hardhat-deploy-ethers");
require('@openzeppelin/hardhat-upgrades');

const promptly = require('promptly');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('fund', "Send eth to an address", async () => {
  const to = await promptly.prompt('Address:');
  const value = await promptly.prompt('Value:');

  const signer = await ethers.getSigners();

  const fundTransaction = await signer[0].sendTransaction({to: to, value: ethers.utils.parseEther(value)});
  console.log(fundTransaction);
});

task("create-wallet", "Creates a new wallet json", async () => {
  const wallet = ethers.Wallet.createRandom();

  console.log('New wallet:');
  console.log(`Address: ${wallet.address}`);
  console.log(`Public key: ${wallet.publicKey}`);
  console.log(`Private key: ${wallet.privateKey}`);
  console.log(`Mnemonic: ${JSON.stringify(wallet.mnemonic)}`);

  const password = await promptly.prompt('Encryption password: ')
  const encryptedJSON = await wallet.encrypt(password);

  console.log('Encrypted wallet JSON:');
  console.log(encryptedJSON);
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
  // defaultNetwork: 'localhost',
  networks: {
    hardhat: {
      chainId: 1337
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  }
};
