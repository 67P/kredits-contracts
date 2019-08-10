const ethers = require('ethers');
const namehash = require('ethers').utils.namehash;

// eslint-disable-next-line no-undef
const Contribution = artifacts.require("Contribution.sol");
// eslint-disable-next-line no-undef
const Contributor = artifacts.require("Contributor.sol");
// eslint-disable-next-line no-undef
const Token = artifacts.require("Token.sol");

// eslint-disable-next-line no-undef
const getContract = name => artifacts.require(name);
const { assertRevert } = require('@aragon/test-helpers/assertThrow');

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

const timeTravel = function(time){
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [time], //86400 is num seconds in day
      id: new Date().getSeconds(),
    }, (err, result) => {
      if(err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const mineBlock = function() {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_mine",
      params: [],
      id: new Date().getSeconds(),
    }, (err, result) => {
      if(err){ return reject(err); }
      return resolve(result);
    });
  });
};

contract('Contribution app', (accounts) => {
  // eslint-disable-next-line no-undef
  let ethProvider = new ethers.providers.Web3Provider(web3.currentProvider);
  let kernelBase, aclBase, daoFactory, r, dao, acl, contribution, token, contributor;

  const root = accounts[0];
  const member1 = accounts[1];
  const blocksToWait = 40320;

  // eslint-disable-next-line no-undef
  before(async () => {
    kernelBase = await getContract('Kernel').new(true); // petrify immediately
    aclBase = await getContract('ACL').new();
    daoFactory = await getContract('DAOFactory').new(kernelBase.address, aclBase.address, ZERO_ADDR);
    r = await daoFactory.newDAO(root);
    dao = getContract('Kernel').at(r.logs.filter(l => l.event == 'DeployDAO')[0].args.dao);
    acl = getContract('ACL').at(await dao.acl());

    //create dao mamnager permission for coin owner
    await acl.createPermission(
      root,
      dao.address,
      await dao.APP_MANAGER_ROLE(),
      root,
      { from: root }
    );

    //apps id
    let appsId = [];
    appsId[0] = namehash("kredits-contribution");
    appsId[1] = namehash("kredits-contributor");
    appsId[2] = namehash("kredits-proposal");
    appsId[3] = namehash("kredits-token");


    //get new app instance from DAO
    let receipt = await dao.newAppInstance(
      appsId[0],
      (await Contribution.new()).address,
      0x0,
      false,
      { from: root }
    );
    contribution = Contribution.at(
      receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy
    );

    receipt = await dao.newAppInstance(
      appsId[3],
      (await Token.new()).address,
      0x0,
      false,
      { from: root }
    );
    token = Token.at(
      receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy
    );

    receipt = await dao.newAppInstance(
      appsId[1],
      (await Contributor.new()).address,
      0x0,
      false,
      { from: root }
    );
    contributor = Contributor.at(
      receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy
    );

    //init app
    await contribution.initialize(appsId);

    await acl.createPermission(
      root,
      contribution.address,
      await contribution.ADD_CONTRIBUTION_ROLE(),
      root,
      { from: root }
    );

    await acl.createPermission(
      root,
      contribution.address,
      await contribution.VETO_CONTRIBUTION_ROLE(),
      root,
      { from: root }
    );

    //init token (app)
    await token.initialize(appsId);

    //create token mint permission for coin owner
    await acl.createPermission(
      contribution.address,
      token.address,
      await token.MINT_TOKEN_ROLE(),
      root,
      { from: root }
    );

    //init contributor app
    await contributor.initialize(root, appsId);

    await acl.createPermission(
      root,
      contributor.address,
      await contributor.MANAGE_CONTRIBUTORS_ROLE(),
      root,
      { from: root }
    );
  });

  describe("Owner default space permissions", async () => {
    it('check owner can add contribution', async () => {
      let addContributionPermission = await acl.hasPermission(root, contribution.address, await contribution.ADD_CONTRIBUTION_ROLE());
      // eslint-disable-next-line no-undef
      assert.equal(addContributionPermission, true);
    });

    it('check owner can veto contribution', async () => {
      let vetoContributionPermission = await acl.hasPermission(root, contribution.address, await contribution.VETO_CONTRIBUTION_ROLE());
      // eslint-disable-next-line no-undef
      assert.equal(vetoContributionPermission, true);
    });

    it('check contribution app can mint token', async () => {
      let mintTokenPermission = await acl.hasPermission(contribution.address, token.address, await token.MINT_TOKEN_ROLE());
      // eslint-disable-next-line no-undef
      assert.equal(mintTokenPermission, true);
    });
  });

  describe("Add contribution", async () => {
    let amount = 100;
    let contributorId = 1;
    let hashDigest = '0x0000000000000000000000000000000000000000000000000000000000000000';
    let hashFunction = 1;
    let hashSize = 1;

    it("should revert when add contribution from address that does not have permission", async () => {
      return assertRevert(async () => {
        await contribution.add(amount, contributorId, hashDigest, hashFunction, hashSize, {from: member1});
        'sender does not have permission';
      });
    });

    it("should revert when add contribution with amount equal to zero", async () => {
      return assertRevert(async () => {
        await contribution.add(0, contributorId, hashDigest, hashFunction, hashSize, {from: root});
        'amount equal to zero';
      });
    });

    it("should add contribution", async () => {
      let contributionCountBefore = await contribution.contributionsCount();
      await contribution.add(amount, contributorId, hashDigest, hashFunction, hashSize, {from: root});
      let contributionCountAfter = await contribution.contributionsCount();
      // eslint-disable-next-line no-undef
      assert.equal(contributionCountAfter.toNumber()-contributionCountBefore.toNumber(), 1, "contributions counter incremented");
      let contributionObject = await contribution.getContribution(contributionCountAfter.toNumber());
      // eslint-disable-next-line no-undef
      assert.equal(contributionObject[1], contributorId, "contribution added belong to contributor id");
      let isExist = await contribution.exists(contributionCountAfter.toNumber());
      // eslint-disable-next-line no-undef
      assert.equal(isExist, true, "contribution exist");
    });
  });

  describe("Veto contribution", async () => {
    it("should revert when veto from address that does not have permission", async () => {
      const contributionId = await contribution.contributionsCount();
      return assertRevert(async () => {
        await contribution.veto(contributionId.toNumber(), {from: member1});
        'sender does not have permission to veto';
      });
    });

    it("should revert when veto contribution that does not exist", async () => {
      const contributionId = await contribution.contributionsCount();
      return assertRevert(async () => {
        await contribution.veto(contributionId.toNumber()+1, {from: root});
        'contribution not found';
      });
    });

    it("veto contribution", async () => {
      const contributionId = await contribution.contributionsCount();
      let contributionObject = await contribution.getContribution(contributionId.toNumber());
      console.log("veto block: " + contributionObject[7]);
      console.log("current block: " + await ethProvider.getBlockNumber());
      await contribution.veto(contributionId.toNumber(), {from: root});
      // eslint-disable-next-line no-undef
      assert(contributionObject[9], true);
    });
  });

  describe("Claim contribution", async () => {
    let contributionId;

    // eslint-disable-next-line no-undef
    before(async () =>{
      let amount = 200;
      let contributorId = 1;
      let hashDigest = '0x0000000000000000000000000000000000000000000000000000000000000000';
      let hashFunction = 1;
      let hashSize = 1;
  
      await contribution.add(amount, contributorId, hashDigest, hashFunction, hashSize, {from: root});
    
      contributionId = await contribution.contributionsCount();
    });

    it("should revert when claim contribution that does not exist", async () => {
      return assertRevert(async () => {
        await contribution.claim(contributionId.toNumber()+1, {from: root});
        'contribution not found';
      });
    });

    it("should revert when claim contribution before confirmation block", async () => {
      return assertRevert(async () => {
        await contribution.claim(contributionId.toNumber(), {from: root});
        'contribution not confirmed yet';
      });
    });

    it("claim contribution", async () => {
      if(contributionId < 10) {
        await timeTravel(100);
      }
      else {
        await timeTravel(blocksToWait);
      }
      await mineBlock();

      let contributionObject = await contribution.getContribution(contributionId.toNumber());
      console.log("claim block: " + contributionObject[7]);
      console.log("current block: " + await ethProvider.getBlockNumber());

      await contribution.claim(contributionId);
      // eslint-disable-next-line no-undef
      assert(contributionObject[3], true);
    });

    it("should revert when claim already claimed contribution", async () => {
      return assertRevert(async () => {
        await contribution.claim(contributionId.toNumber(), {from: root});
        'contribution already claimed';
      });
    });

  });

  describe("Veto claimed contribution", async () => {
    // eslint-disable-next-line no-undef
    before(async () => {
      let amount = 200;
      let contributorId = 1;
      let hashDigest = '0x0000000000000000000000000000000000000000000000000000000000000000';
      let hashFunction = 1;
      let hashSize = 1;

      const contributionIdBefore = await contribution.contributionsCount();

      //add contribution
      await contribution.add(amount, contributorId, hashDigest, hashFunction, hashSize, {from: root});

      const contributionId = await contribution.contributionsCount();
      // eslint-disable-next-line no-undef
      assert.equal(contributionId.toNumber()-contributionIdBefore.toNumber(), true, "contribution added");
      
      //Claim contribution
      if(contributionId < 10) {
        await timeTravel(100);
      }
      else {
        await timeTravel(blocksToWait);
      }
      await mineBlock();
      await contribution.claim(contributionId);
    });
    
    it("should revert when veto already claimed contribution", async () => {  
      const contributionId = await contribution.contributionsCount();

      return assertRevert(async () => {
        await contribution.veto(contributionId.toNumber(), {from: root});
        'contribution already claimed';
      });
    });  
  });

});
