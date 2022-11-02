[![npm](https://img.shields.io/npm/v/@kredits/contracts.svg)](https://www.npmjs.com/package/@kredits/contracts)

# Kredits Contracts

This repository contains the Solidity smart contracts and the JavaScript API
wrapper for [Kosmos Kredits](https://wiki.kosmos.org/Kredits).

## Development

### Installation

#### App dependencies

All requirements are defined in `package.json`.

    $ npm install

### Local development chain

We use [hardhat](https://hardhat.org/) as development environment for the
smart contracts.

To run a local development chain run:

    $ npm run devchain # or: hardhat node --network hardhat

### Bootstrap

1.  Run an Ethereum node and ipfs

        $ npm run devchain
        $ ipfs daemon

2.  Compile contracts and build ABIs

        (compiled artifacts will be in `/artifacts`)
        $ npm run build

3.  Deploy new upgradable contract proxies

        $ npm run deploy:dao

4.  Execute seeds to create demo contributors, contributions, etc. (optional)

        $ npm run seeds

**Step 2-4 is also summarized in `npm run bootstrap`**

5.  Show contract addresses

        $ cat lib/addresses.json

## Fund a local development account

If you need to fund development accounts with devchain coins:

    $ npm run fund # or hardhat fund --network localhost

## Contract architecture

We use the [OpenZeppelin hardhat
proxy](https://www.npmjs.com/package/@openzeppelin/hardhat-upgrades) for
deploying and managing upgradeable contracts. (see `scripts/create-proxy.js`)

Each contract is independent and is connected to its dependencies by storing
the addresses of the other contracts.

## Helper scripts

`scripts/` contains some helper scripts to interact with the contracts from the
CLI. _At some point these should be moved into a real nice CLI._

To run these scripts use `hardhat run`. For example: `hardhat run
scripts/list-contributors.js --network localhost`. (NOTE: add `--network
localhost` or the network you want to use)

Some scripts are also defined as npm script, see `package.json`.

### repl/console

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

We use OpenZeppelin for an upgradeable contracts:
[https://www.npmjs.com/package/@openzeppelin/hardhat-upgrades](https://www.npmjs.com/package/@openzeppelin/hardhat-upgrades)

Refer to the OpenZeppelin README and `scripts/create-proxy.js`

[OpenZeppelin Step by Step guide](https://forum.openzeppelin.com/t/openzeppelin-upgrades-step-by-step-tutorial-for-hardhat/3580)

For an upgrade example checkout `scripts/upgrade-example.js`


## Deployment to other networks

Deployable networks are configured in the `hardhat.config.js`.

To deploy to those networks provide the `--network` argument to the hardhat
commands, e.g. `--network rsk`.

Please note that some npm scripts combine multiple hardhat commands. In those
cases the hardhat commands needs to be run manually with the `--network`
argument. (=> don't use `npm run bootstrap`)

Set a `DEPLOY_KEY` environment variable with the private key (HEX) which will
be used as a root/deploy account

Typical deployment flow:

    $ npm run build
    $ hardhat run scripts/create-proxy.js --network rsk
    # OR with deploy key:
    $ DEPLOY_KEY=0xsomething hardhat run scripts/create-proxy.js --network rsk
    $ # commit the new addresses in the addresses.json file if needed

To run the console on one of the non localhost networks you can also just pass
on the --network argument.

    $ hardhat console --network rsk


## Known Issues

When resetting ganache Metamask might have an invalid transaction nonce and
transactions get rejected. Nonces in Ethereum must be incrementing and have no
gap.

To solve this reset the metamask account (Account -> Settings -> Reset Account)
