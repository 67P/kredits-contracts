[![npm](https://img.shields.io/npm/v/kredits-contracts.svg)](https://www.npmjs.com/package/kredits-contracts)

# Kredits Contracts

This repository contains the Solidity smart contracts organized as [Aragon](https://hack.aragon.org/) 
apps and JavaScript API wrapper for [Kosmos Kredits](https://wiki.kosmos.org/Kredits).

It is based on [aragonOS](https://hack.aragon.org/docs/aragonos-intro.html) and 
follows the aragonOS conventions.
Aragon itself uses the [Truffle framework](http://truffleframework.com/) for some things.

## Development

### Installation

    $ npm install

### Requirements

All requirements are defined in `package.json`.

### Local development chain

For local development it is recommended to use 
[ganache](http://truffleframework.com/ganache/) to run a local development 
chain. Using the ganache simulator no full Ethereum node is required.

We use the default aragon-cli devchain command to confgure and run a local 
development ganache.

`npm run devchain` (or `aragon devchain --port 7545)

To clear/reset the chain use: 

`npm run devchain -- --reset` (or `aragon devchain --port 7545 --reset`)

We default to port 7545 for development to not get in conflict with the default 
Ethereum RPC port.


## Contract Deployment

Contracts are organized in independent apps (see `/apps`) and are developed 
and deployed independently. Each app has a version and can be "installed" 
on the Kredits DAO independently.

![](docs/kredits-diagram.png)

A DAO can be deployed using the `scripts/deploy-kit.js` script or with the 
`npm run deploy:dao:dev` command. This deploys a new Kredits DAO, installs
the latest app versions and sets the required permissions.

See each app in `/apps/*` for details.

## ACL / Permissions

## Helper scripts

`scripts/` contains some helper scripts to interact with the contracts from the
CLI. _At some point these should be moved into a real nice CLI._

To run these scripts use `truffle exec`. For example: `truffle exec
scripts/add-proposal.js`.

### cli.js

Call any function on any contract:

    $ truffle exec scripts/cli.js

### repl.js

Similar to cli.js but only provides a REPL with an initialized `kredits`
instance.

    $ truffle exec scripts/repl.js

### add-contributor.js

Adds a new core contributor, creates a proposal for the new contributor and
votes for that one.

    $ truffle exec scripts/add-contributor.js

### add-proposal.js

Adds a new proposal for an existing contributor

    $ truffle exec scripts/add-proposal.js

### add-contribution.js

Adds a new contribution for an existing contributor

    $ truffle exec scripts/add-contribution.js

### send-funds.js

Sends funds to an address. Helpful in development mode to for example fund a
metamask account.

    $ truffle exec scripts/send-funds.js

### seeds.js
Run seeds defined in `config/seeds.js`.

    $ truffle exec scripts/seeds.js
    or
    $ npm run seeds

## Upgradeable contracts

We use aragonOS for upgradeablity of the different contracts.
Refer to the [aragonOS upgradeablity documentation](https://hack.aragon.org/docs/upgradeability-intro) 
for more details.

### Example

1. Setup
    1. Deploy each contract/apps (see `/apps/*`)
    2. Create a new DAO (see scripts/deploy-kit.js)
2. Update
    1. Deploy a new Version of the contract/app (see `/apps/*`)
    2. Use the `aragon dao upgrade` command to "install" the new version for the DAO
      (`aragon dao upgrade <DAO address> <app name>`)

## Known Issues

When resetting ganache Metamask might have an invalid transaction nonce and
transactions get rejected. Nonces in Ethereum must be incrementing and have no
gap.

To solve this reset the metamask account (Account -> Settings -> Reset Account)
