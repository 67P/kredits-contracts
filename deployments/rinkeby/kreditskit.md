# KreditsKit deployments

## 2019-03-26

Using network 'rinkeby'.

Deploying to networkId: 4
Using ENS at: 0x98Df287B6C145399Aaa709692c8D308357bC085D
Using DAOFactory at: 0x2298d27a9b847c681d2b2c2828ab9d79013f5f1d
Found apps: [contribution,contributor,proposal,token].open.aragonpm.eth
Deployed KreditsKit at: 0x1d6a9c2146a330575ee860eef9a012b5ff7caa68



### fails
a few deployments to fix the deploy script

## 2019-03-25

### fixed kit with correct appids

kredits/truffle-kredits@aragonos  » aragon contracts exec scripts/deploy-kit.js --debug --network=rinkeby    
 ℹ Use of `--network` is deprecated and has been replaced with `--environment`. You may need to update your arapp.json
 ℹ Passing the command to Truffle
Using network 'rinkeby'.

Deploying to networkId: 4
Using ENS at: 0x98Df287B6C145399Aaa709692c8D308357bC085D
Using DAOFactory at: 0x2298d27a9b847c681d2b2c2828ab9d79013f5f1d
Found apps: [contribution,contributor,proposal,token].open.aragonpm.eth
Deployed KreditsKit at: 0xf4f3963718e5c2b426dd5c3ef0ab4b31ffb7a318

from account: 0x18f6d06de7e6d556b1bbb5875f8cfafb5eaef9c5

### test with fixed deploy script
kredits/truffle-kredits@aragonos  » ENS=0x98df287b6c145399aaa709692c8d308357bc085d DAO_FACTORY=0x2298d27a9b847c681d2b2c2828ab9d79013f5f1d truffle exec scripts/deploy-kit.js --network=rinkeby
Using network 'rinkeby'.

Deploying to networkId: 4
Using ENS at: 0x98df287b6c145399aaa709692c8d308357bc085d
Using DAOFactory at: 0x2298d27a9b847c681d2b2c2828ab9d79013f5f1d
Deployed KreditsKit at: 0x83afd3c99563fc467aec69e0187ffd53fc8faa76

### success
kredits/truffle-kredits@aragonos  » ENS=0x98df287b6c145399aaa709692c8d308357bc085d DAO_FACTORY=0x2298d27a9b847c681d2b2c2828ab9d79013f5f1d truffle exec scripts/deploy-kit.js --network=rinkeby
Using network 'rinkeby'.

Using ENS at: 0x98df287b6c145399aaa709692c8d308357bc085d
Using DAOFactory at: 0x2298d27a9b847c681d2b2c2828ab9d79013f5f1d
Deployed KreditsKit at: 0x1fd2f9206addaf86f3ef921a3b7c84400374ba68

### deployment script error:
deployment script failure at: https://rinkeby.etherscan.io/tx/0x3571b889b6b9b2b3f26dd0ee7fb82c7ece90b28d910078f2e06753d878832af4"

