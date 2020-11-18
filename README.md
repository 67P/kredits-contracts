[![npm](https://img.shields.io/npm/v/kredits-contracts.svg)](https://www.npmjs.com/package/kredits-contracts)

# Kredits Contracts

This repository contains the Solidity smart contracts organized as
[Aragon](https://hack.aragon.org/) apps and JavaScript API wrapper for [Kosmos
Kredits](https://wiki.kosmos.org/Kredits).

It is based on [aragonOS](https://hack.aragon.org/docs/aragonos-intro.html) and
follows the aragonOS conventions.  Aragon itself uses the [Truffle
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

    $ npm run devchain -- --reset (or aragon devchain --port 7545 --reset)

We default to port 7545 for development to not get in conflict with the default
Ethereum RPC port.

You can also set certain ganache options to configure the devchain, for example
if you want to increase the block time to 10 seconds you can add
`--block-time=10`.

### Bootstrap

1. Run an Ethereum node and ipfs

        $ npm run devchain
        $ ipfs daemon

2. Compile contracts

        (compiled contracts will be in `/build`)
        $ npm run compile-contracts

3. Deploy each app to the devchain

        (make sure you've run `npm install` for every app - see installation)
        $ npm run deploy:apps

4. Deploy a new KreditsKit and create a new DAO with the latest app versions

        $ npm run deploy:kit
        $ npm run deploy:dao

5. Execute seeds to create demo contributors, contributions, etc. (optional)

        $ npm run seeds

**Step 2-5 is also summarized in `npm run bootstrap`**

If you want to reset your local setup:

        $ npm run reset // deploys a new kit and a new DAO
        $ npm run reset:hard // deploys all apps and does reset

## Contract architecture

Contracts are organized in independent apps (see `/apps`) and are developed and
deployed independently. Each app has a version and can be "installed" on the
Kredits DAO independently.

![](docs/kredits-diagram.png)

A DAO can be deployed using the `scripts/deploy-kit.js` script or with the
`npm run deploy:dao` command. This deploys a new Kredits DAO, installs the
latest app versions and sets the required permissions.

See each app in `/apps/*` for details.


## Helper scripts

`scripts/` contains some helper scripts to interact with the contracts from the
CLI. _At some point these should be moved into a real nice CLI._

To run these scripts use `truffle exec`. For example: `truffle exec
scripts/add-proposal.js`.

Some scripts are also defined as npm script, see package.json.

### cli.js

Call any function on any contract:

    $ truffle exec scripts/cli.js

### repl.js

Similar to cli.js but only provides a REPL with an initialized `kredits`
instance.

    $ truffle exec scripts/repl.js

### add-{contributor, contribution, proposal}.js

Script to add a new entries to the contracts using the JS wrapper

    $ truffle exec scripts/add-{contributor, contribution, proposal}.js

### list-{contributors, contributions, proposals}.js

List contract entries

    $ truffle exec scripts/list-{contributors, contributions, proposals}.js

### send-funds.js

Sends funds to an address. Helpful in development mode to for example fund a
metamask account.

    $ truffle exec scripts/send-funds.js

### seeds.js

Run seeds defined in `config/seeds.js`.

    $ truffle exec scripts/seeds.js
    or
    $ npm run seeds

### current-address.js

Prints all known DAO addresses and the DAO address for the current network

    $ truffle exec scripts/current-address.js
    or
    $ npm run dao:address

### deploy-kit.js

Deploys a new KreditsKit that allows to create a new DAO

    $ truffle exec script/deploy-kit.js
    or
    $ npm run deploy:kit

#### Kredits configuration options:

Configuration options can be set in an environment specific `kredits` object in the `arapp.json` or using a CLI parameter.

* daoFactory: Ethereum address of the used DAO Factory. On public networks we use [official aragon factories](https://github.com/aragon/deployments/tree/master/environments/)
* apmDomain: the ENS domain of the aragonPM (normally `open.aragonpm.eth`)

(please also see the [arapp.json related configuration options](https://hack.aragon.org/docs/cli-global-confg#the-arappjson-file))

### new-dao.js

Creates and configures a new DAO instance.

    $ truffle exec script/new-dao.js
    or
    $ npm run deploy:dao

KreditsKit address is loaded from `lib/addresses/KreditsKit.json` or can be
configured through the `KREDITS_KIT` environment variable.

### deploy-apps.sh

Runs `npm install` for each app and publishes a new version.

    $ ./scripts/deploy-apps.sh
    or
    $ npm run deploy:apps

## Deployment

### Apps deployment

To deploy a new app version run:

    $ aragon apm publish major --environment=NETWORK_TO_DEPLOY

### KreditsKit

deploy the KreditsKit as Kit to create new DAOs

    $ truffle exec scripts/deploy-kit.js --network=NETWORK_TO_DEPLOY

### Creating a new DAO

make sure all apps and the KreditsKit are deployed, then create a new DAO:

    $ truffle exec scripts/new-dao.js --network=NETWORK_TO_DEPLOY

## ACL / Permissions

## Upgradeable contracts

We use aragonOS for upgradeability of the different contracts.  Refer to the
[aragonOS upgradeablity documentation](https://hack.aragon.org/docs/upgradeability-intro)
for more details.

### Example

1. Setup (see #Bootstrap)
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
