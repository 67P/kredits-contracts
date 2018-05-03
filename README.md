# Kredits Contracts

This repository contains the Solidity smart contracts and JavaScript API
wrapper for [Kosmos Kredits](https://wiki.kosmos.org/Kredits).

It uses the [Truffle framework](http://truffleframework.com/) for some things.

## Development

### Installation

    $ npm install

### Requirements

All requirements are defined in `package.json`.

Those can be installed globally for convenience:

  * [truffle framework](http://truffleframework.com): `npm install -g truffle`
  * [ganache](http://truffleframework.com/ganache): `npm install -g ganache-cli`

We use following solidity contract libraries:

  * [Open Zeppelin](https://github.com/OpenZeppelin/zeppelin-solidity)

For local development it is recommended to use
[ganache-cli](https://github.com/trufflesuite/ganache-cli) (or the [ganache
GUI](http://truffleframework.com/ganache/) to run a local development chain.
Using the ganache simulator no full Ethereum node is required.

We default to:

* port 7545 for development to not get in conflict with the default Ethereum
  RPC port.
* network ID 100 to stay on the same network id
* store ganache data in .ganache-db to presist the chain data across restarts
* use a fixed Mnemonic code to get the same accounts across restarts

Have a look at `ganache-cli` for more configuration options.

Run your ganache simulator before using Kredits locally:

    $ npm run ganache (which is: ganache-cli -p 7545 -i 100 --db=./.ganache-db -m kredits)

### Truffle console

Truffle comes with a simple REPL to interact with the Smart Contracts. Have a
look at the [documentation
here](http://truffleframework.com/docs/getting_started/console)

NOTE: There are promisses, have a look at the examples:

```javascript
Token.deployed().then(function(token) {
  token.totalSupply.call().then(function(value) {
    console.log(value.toString());
  })
});
```

Also please be aware of the differences between web3.js 0.2x.x and
[1.x.x](https://web3js.readthedocs.io/en/1.0/) - [web3
repo](https://github.com/ethereum/web3.js/)

## Contract Deployment

Truffle uses migration scripts to deploy contract to various networks. Have a
look at the `migrations` folder for those.  The Ethereum nodes for the
different networks need to be configured in `truffle.js`.

Run the truffle migration scripts:

    $ truffle deploy
    $ truffle deploy --network=<network config from truffle.js>

Truffle keeps track of already executed migration scripts. To reset the
migration use the `--reset` option

    $ truffle migrate --reset

Migration scripts can also be run from within `truffle console` or `truffle
develop`

To initially bootstrap a local development chain in ganache you can use the
bootstrap script:

    $ npm run bootstrap

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

Some of the contracts use upgradability ideas from
[zeppelinos](https://github.com/zeppelinos/labs) (see `contracts/upgradable`).

The basic idea is to have a Registry contract that knows about the current
implementations and a Proxy contract that uses `delegatecall` to call the
current implementation.  That means the Proxy contract holds the storage and
the address of that one does not change but the actuall implemenation is
managed through the Registry.

To deploy a new version a new contract is deployed then the version is
registered (`addVersion()`) in the Registry and on the Proxy contract is
"upgraded" (`upgrade()`) to the new version.

The Registry knows about all the different contracts and implementations.
Versions are stored as uint and automatically incremented for every added
implementation.

### Example

Deployment is best done using the truffle deployer.

1. Setup
    1. Deploy the Registry
    2. Deploy the contract
    3. Register the contract at the Registry:
        `registry.addVersion('Token', Token.address)`
    4. Create the Proxy:
        `registry.createProxy('Token', 1)`
2. Update
    1. Deploy a new Version of the contract
    2. Register the new version at the Registry:
        `registry.addVersion('Token', NewToken.address)`
    3. Set the new implementation address on the Proxy contract:
        `registry.upgrade('Token', 2)`

## Known Issues

When resetting ganache Metamask might have an invalid transaction nonce and
transactions get rejected. Nonces in Ethereum must be incrementing and have no
gap.

To solve this reset the metamask account (Account -> Settings -> Reset Account)
