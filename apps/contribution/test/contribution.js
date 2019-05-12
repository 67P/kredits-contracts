const namehash = require('eth-ens-namehash').hash;

// eslint-disable-next-line no-undef
const Contribution = artifacts.require("Contribution.sol");
const { Token, getTokenContract } = require("../../token/artifacts");

// eslint-disable-next-line no-undef
const getContract = name => artifacts.require(name);
const { assertRevert } = require('@aragon/test-helpers/assertThrow');

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

contract('Contribution app', (accounts) => {
    let kernelBase, aclBase, daoFactory, r, dao, acl, contribution, token;
  
    const root = accounts[0];
    const member1 = accounts[1];

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
            (await getTokenContract('Token').new()).address,
            0x0,
            false,
            { from: root }
        );
        token = Token.at(
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
            root,
            token.address,
            await token.MINT_TOKEN_ROLE(),
            root,
            { from: root }
        );

        //acl.grantPermission(contribution, token, await token.MINT_TOKEN_ROLE(), {from: root});            
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

        it("add contribution", async () => {
            let contributionCountBefore = await contribution.contributionsCount();
            await contribution.add(amount, contributorId, hashDigest, hashFunction, hashSize, {from: root});
            let contributionCountAfter = await contribution.contributionsCount();
            // eslint-disable-next-line no-undef
            assert.equal(contributionCountAfter.toNumber()-contributionCountBefore.toNumber(), 1);
            let contributionObject = await contribution.getContribution(contributionCountAfter.toNumber());
            // eslint-disable-next-line no-undef
            assert.equal(contributionObject[1], contributorId);
            let isExist = await contribution.exists(contributionCountAfter.toNumber());
            // eslint-disable-next-line no-undef
            assert.equal(isExist, true);
        });
    });

    describe("Veto/Claim contribution", async () => {

        it("should revert when veto from address that does not have permission", async () => {
            let contributionId = await contribution.contributionsCount();
            return assertRevert(async () => {
                await contribution.veto(contributionId.toNumber(), {from: member1});
              'sender does not have permission to veto';
            });
        });

        it("should revert when veto contribution that does not exist", async () => {
            let contributionId = await contribution.contributionsCount();
            return assertRevert(async () => {
                await contribution.veto(contributionId.toNumber()+1, {from: root});
              'contribution not found';
            });
        });

        it("should revert when claim contribution that does not exist", async () => {
            let contributionId = await contribution.contributionsCount();
            return assertRevert(async () => {
                await contribution.claim(contributionId.toNumber()+1, {from: root});
              'contribution not found';
            });
        });

        it("claim contribution", async () => {
            let contributionId = await contribution.contributionsCount();
            await contribution.claim(contributionId);
            let contributionObject = await contribution.getContribution(contributionId.toNumber());
            // eslint-disable-next-line no-undef
            assert(contributionObject[3], true);
        });

        it("should revert when claim already claimed contribution", async () => {
            let contributionId = await contribution.contributionsCount();
            return assertRevert(async () => {
                await contribution.claim(contributionId.toNumber(), {from: root});
              'contribution already claimed';
            });
        });

        it("should revert when veto already claimed contribution", async () => {
            let contributionId = await contribution.contributionsCount();
            return assertRevert(async () => {
                await contribution.veto(contributionId.toNumber(), {from: root});
              'contribution already claimed';
            });
        });


    });
  
});
