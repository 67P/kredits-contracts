[![npm](https://img.shields.io/npm/v/kredits-contracts.svg)](https://www.npmjs.com/package/kredits-contracts)

# Kredits Contracts

This repository contains the Solidity smart contracts organized as
[Aragon](https://hack.aragon.org/) apps and JavaScript API wrapper for [Kosmos
Kredits](https://wiki.kosmos.org/Kredits).

It is based on [aragonOS](https://hack.aragon.org/docs/aragonos-intro.html) and
follows the aragonOS conventions. Aragon itself uses the [Truffle
framework](http://truffleframework.com/) for some things.

## Development

### Installation

#### App dependencies

All requirements are defined in `package.json`.

    $ npm install

Each of the aragon apps are separate packages:

    $ cd apps/[app]
    $ npm install

You can use `npm run install-all` to install all app dependencies at once.

#### Sytem dependencies

Aragon CLI and Truffle need to be installed on your sytem as well:

    npm install -g @aragon/cli
    npm install -g truffle

_Note: `@aragon/cli` currently fails to install on node.js 14. Please use
node.js 12 until the issue has been resolved upstream._

### Local development chain

For local development it is recommended to use
[ganache](http://truffleframework.com/ganache/) to run a local development
chain. When using the ganache simulator, no full Ethereum node is required.

We use the default aragon-cli devchain command to configure and run a local
development ganache.

    $ npm run devchain (or aragon devchain --port 7545)

To clear/reset the chain use (e.g. if you run out of funds on your devchain)

    $ npm run devchain --

We default to port 7545 for development to not get in conflict with the default
Ethereum RPC port.

You can also set certain ganache options to configure the devchain, for example
if you want to increase the block time to 10 seconds you can add
`--block-time=10`.

### Bootstrap

1.  Run an Ethereum node and ipfs

        $ npm run devchain
        $ ipfs daemon

2.  Compile contracts and build ABIs

        (compiled artifacts will be in `/artifacts`)
        $ npm run build

3.  Deploy a new KreditsKit and create a new DAO with the latest app versions

        $ npm run deploy:dao

4.  Execute seeds to create demo contributors, contributions, etc. (optional)

        $ npm run seeds

**Step 2-4 is also summarized in `npm run bootstrap`**

5.  Show contract addresses

        $ cat lib/addresses.json

## Contract architecture

We use the [OpenZeppelin hardhat proxy](https://www.npmjs.com/package/@openzeppelin/hardhat-upgrades) for deploying and managing upgradeable contracts. (see `scripts/create-proxy.js`)

Each contract is independent and is connected to its dependencies by storing the addresses of the other contracts.

## Helper scripts

`scripts/` contains some helper scripts to interact with the contracts from the
CLI. _At some point these should be moved into a real nice CLI._

To run these scripts use `hardhat run`. For example: `hardhat run scripts/list-contributors.js --network localhost`. (NOTE: add `--network localhost` or the network you want to use)

Some scripts are also defined as npm script, see package.json.

### cli.js

Call any function on any contract:

    $ truffle exec scripts/cli.js

### repl.js

Similar to cli.js but only provides a REPL with an initialized `kredits`
instance.

    $ hardhat console --network localhost

### add-{contributor, contribution, proposal}.js

Script to add a new entries to the contracts using the JS wrapper

    $ hardhat run scripts/add-{contributor, contribution, proposal}.js --network localhost

### list-{contributors, contributions, proposals}.js

List contract entries

    $ hardhat run scripts/list-{contributors, contributions, proposals}.js --network localhost

### seeds.js

Run seeds defined in `config/seeds.js`.

    $ npm run seeds

### Get the contract addresses

All contract addresses are stored in `lib/addresses.json`

    $ cat lib/addresses.json

## Upgradeable contracts

We use OpenZeppelin for an upgradeable contracts: [https://www.npmjs.com/package/@openzeppelin/hardhat-upgrades](https://www.npmjs.com/package/@openzeppelin/hardhat-upgrades)

Refer to the OpenZeppelin README and `scripts/create-proxy.js`

## Known Issues

When resetting ganache Metamask might have an invalid transaction nonce and
transactions get rejected. Nonces in Ethereum must be incrementing and have no
gap.

To solve this reset the metamask account (Account -> Settings -> Reset Account)
