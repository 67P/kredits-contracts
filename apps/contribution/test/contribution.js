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

const getBlockNumber = function() {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    web3.eth.getBlockNumber(async (err, res) => {
      if (err || !res) return reject(err);
      resolve(res);
    });
  });
};

contract('Contribution app', (accounts) => {
  // eslint-disable-next-line no-undef
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
    // contributor detials
    let account, contributorHashDigest, contributorHashFunction, contributorHashSize;
    // contribution details
    let amount, contributorId, hashDigest, hashFunction, hashSize;

    // eslint-disable-next-line no-undef
    before(async () => {
      // Add contributor from Contributor app
      account = root;
      contributorHashDigest = '0x0000000000000000000000000000000000000000000000000000000000000000';
      contributorHashFunction = 0;
      contributorHashSize = 0;
      await contributor.addContributor(account, contributorHashDigest, contributorHashFunction, contributorHashSize);
      // eslint-disable-next-line no-undef
      assert.equal(await contributor.addressExists(account), true);

      amount = 100;
      contributorId = await contributor.getContributorIdByAddress(root);
      hashDigest = '0x0000000000000000000000000000000000000000000000000000000000000000';
      hashFunction = 1;
      hashSize = 1;  
    });

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
      assert.equal(contributionObject[1].toNumber(), contributorId.toNumber(), "contribution added belong to contributor id");
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
      if(contributionId < 10) {
        return assertRevert(async () => {
          await contribution.veto(contributionId.toNumber(), {from: root});
          'can not veto first 10 contribution';
        });  
      }
      else {
        await contribution.veto(contributionId.toNumber(), {from: root});
        let contributionObject = await contribution.getContribution(contributionId.toNumber());
        // eslint-disable-next-line no-undef
        assert(contributionObject[9], true);  
      }
    });
  });

  describe("Claim contribution", async () => {
    let contributionId;

    // eslint-disable-next-line no-undef
    before(async () =>{
      //add contribution
      let amount = 200;
      let contributorId = await contributor.getContributorIdByAddress(root);
      let contributionHashDigest = '0x0000000000000000000000000000000000000000000000000000000000000000';
      let contributionHashFunction = 1;
      let contributionHashSize = 1;
      await contribution.add(amount, contributorId.toNumber(), contributionHashDigest, contributionHashFunction, contributionHashSize, {from: root});
      contributionId = await contribution.contributionsCount();
    });

    it("should revert when claim contribution that does not exist", async () => {
      return assertRevert(async () => {
        await contribution.claim(contributionId.toNumber()+1, {from: root});
        'contribution not found';
      });
    });

    it("should revert when claim contribution before confirmation block", async () => {
      if(contributionId > 10) {
        return assertRevert(async () => {
          await contribution.claim(contributionId.toNumber(), {from: root});
          'contribution not confirmed yet';
        });
      }
    });

    it("claim contribution", async () => {
      let contributionObject = await contribution.getContribution(contributionId.toNumber());
      let confirmationBlock = contributionObject[7];
      let chainBlockNumberBefore = await getBlockNumber();

      if(contributionId > 10) {
        await timeTravel(blocksToWait);
        await mineBlock();
        let chainBlockNumberAfter = await getBlockNumber();
        // eslint-disable-next-line no-undef
        assert.equal(chainBlockNumberAfter.toNumber()-chainBlockNumberBefore.toNumber(), confirmationBlock.toNumber());
      }
      //Claim contribution
      await contribution.claim(contributionId, {from: root});
      contributionObject = await contribution.getContribution(contributionId.toNumber());
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
});
