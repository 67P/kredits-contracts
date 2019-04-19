const namehash = require('eth-ens-namehash').hash;

const Contributor = artifacts.require("Contributor.sol");

const getContract = name => artifacts.require(name)
const { assertRevert } = require('@aragon/test-helpers/assertThrow');

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

contract('Contributor app', (accounts) => {
    let kernelBase, aclBase, daoFactory, dao, acl, contributor;
  
    const root = accounts[0];
    const member1 = accounts[1];
  
    before(async() => {
        kernelBase = await getContract('Kernel').new(true) // petrify immediately
        aclBase = await getContract('ACL').new()
        daoFactory = await getContract('DAOFactory').new(kernelBase.address, aclBase.address, ZERO_ADDR);
        r = await daoFactory.newDAO(root)
        dao = getContract('Kernel').at(r.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
        acl = getContract('ACL').at(await dao.acl())
    
        //create dao mamnager permission for coin owner
        await acl.createPermission(
            root,
            dao.address,
            await dao.APP_MANAGER_ROLE(),
            root,
            { from: root }
        );
    
        //get new app instance from DAO
        const receipt = await dao.newAppInstance(
            '0x1234',
            (await Contributor.new()).address,
            0x0,
            false,
            { from: root }
        )
        contributor = Contributor.at(
            receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy
        )

        //apps id
        let appsId = [];
        appsId[0] = namehash("kredits-contribution");
        appsId[1] = namehash("kredits-contributor");
        appsId[2] = namehash("kredits-proposal");
        appsId[3] = namehash("kredits-token");
    
        //init contributor (app)
        await contributor.initialize(root, appsId);
    
        //create manage contributors role
        await acl.createPermission(
            root,
            contributor.address,
            await contributor.MANAGE_CONTRIBUTORS_ROLE(),
            root,
            { from: root }
        )
    
    });

    describe("Owner default space permissions", async() => {
        it('check owner is token issuer', async() => {
          let manageContributorPermission = await acl.hasPermission(root, contributor.address, await contributor.MANAGE_CONTRIBUTORS_ROLE());
          assert.equal(manageContributorPermission, true);
        });  
    });

    describe("Add contributor", async() => {
        let account = root;
        let hashDigest = '0x0';
        let hashFunction = 0;
        let hashSize = 0;

        it("should revert when add contributor from an address that does not have permission", async() => {
            return assertRevert(async() => {
              await contributor.addContributor(account, hashDigest, hashFunction, hashSize, { from: member1})
              'sender does not have permission'
            });
        });

        it('add contributor', async() => {
            let contributorCount = await contributor.coreContributorsCount();
            await contributor.addContributor(account, hashDigest, hashFunction, hashSize);
            assert.equal(await contributor.addressExists(account), true);
            let contributorCountAfter = await contributor.coreContributorsCount();
            assert.equal(await contributorCountAfter.toNumber(), parseInt(contributorCount)+1);
        });

        it("should revert when add contributor with an address that already exist", async() => {
            return assertRevert(async() => {
              await contributor.addContributor(account, hashDigest, hashFunction, hashSize, { from: member1})
              'address already exist'
            });
        });
    });

    describe("Update contributor", async() => {
        let id;
        let oldAccount;
        let newAccount;
        let hashDigest;
        let hashFunction;
        let hashSize;

        before(async() =>  {
            id = await contributor.coreContributorsCount();
            oldAccount = root;
            newAccount = member1;
            hashDigest = '0x1';
            hashFunction = 1;
            hashSize = 1;
        });

        it('update contributor account', async() => {
            await contributor.updateContributorAccount(id.toNumber(), oldAccount, newAccount);
            let contributorId = await contributor.getContributorIdByAddress(oldAccount);
            assert.equal(contributorId.toNumber(), 0);
        });

        it("should revert when update contributor account from address that does not have permission", async() => {
            return assertRevert(async() => {
                await contributor.updateContributorAccount(id.toNumber(), oldAccount, newAccount, {from: member1});
              'sender does not have permission'
            });
        });

        it("should revert when update contributor account that does not exist", async() => {
            return assertRevert(async() => {
              await contributor.updateContributorAccount(id.toNumber(), accounts[3], newAccount);
              'contributor does not exist'
            });
        });

        it("should revert when update contributor account with address(0)", async() => {
            return assertRevert(async() => {
              await contributor.updateContributorAccount(id.toNumber(), oldAccount, ZERO_ADDR);
              'contributor does not exist'
            });
        });

        it('update contributor profile hash', async() => {
            await contributor.updateContributorProfileHash(id.toNumber(), hashDigest, hashFunction, hashSize);
            let contributorId = await contributor.getContributorIdByAddress(oldAccount);
            assert.equal(contributorId.toNumber(), 0);
        });

        it("should revert when update contributor profile hash from address that does not have permission", async() => {
            return assertRevert(async() => {
                await contributor.updateContributorProfileHash(id.toNumber(), hashDigest, hashFunction, hashSize, {from: member1});
                'sender does not have permission'
            });
        });

    });
});