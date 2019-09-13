/* eslint-disable no-undef */
const namehash = require('ethers').utils.namehash;
const KreditsKit = artifacts.require("KreditsKit.sol");
const DAOFactory = artifacts.require('DAOFactory');
const getContract = name => artifacts.require(name);
const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
const arapp = require('../arapp.json');
const ENS_ADDRESS = arapp.environments.development.registry;

contract('DAO bare kit', (accounts) => {
  let kreditsKit;
  let address;
  let apps;
  let kernel;
  let space;
  let coin;

  before(async () => {
    //apps id
    const appsId = [];
    appsId[0] = namehash("kredits-contribution");
    appsId[1] = namehash("kredits-contributor");
    appsId[2] = namehash("kredits-proposal");
    appsId[3] = namehash("kredits-token");
    appsId[4] = namehash("vault.aragonpm.eth");

    const kernelBase = await getContract('Kernel').new(true); // petrify immediately
    const aclBase = await getContract('ACL').new();
    const daoFactory = await getContract('DAOFactory').new(kernelBase.address, aclBase.address, ZERO_ADDR);
    
    kreditsKit = await KreditsKit.new(daoFactory, ENS_ADDRESS, appsId, { from: accounts[0] });
  });

  describe("New DAO instance", () => {
    it("kit should be defined", async () => {
      assert.notEqual(kreditsKit, undefined);
    });

    it('it should deploy DAO', async () => {
      const receipt = await kreditsKit.newInstance({ from: accounts[0] });

      address = receipt.logs.filter(l => l.event === 'DeployInstance')[0].args.dao;
      apps = receipt.logs
        .filter(l => l.event === 'InstalledApp')
        .map(event => {
          return { id: event.args.appId, proxy: event.args.appProxy };
        });

      address.should.not.equal(ZERO_ADDR);
    });

    it('it should install apps', async () => {
      apps[0].id.should.equal(namehash('kredits-contribution'));
      apps[1].id.should.equal(namehash('kredits-contributor'));
      apps[0].id.should.equal(namehash('kredits-proposal'));
      apps[1].id.should.equal(namehash('kredits-token'));
      apps[0].id.should.equal(namehash('vault.aragonpm.eth'));
    });

    it('it should initialize apps', async () => {
      contribution = await getContract('Contribution').at(apps[0].proxy);
      contributor = await getContract('Contributor').at(apps[1].proxy);
      proposal = await getContract('Proposal').at(apps[0].proxy);
      token = await getContract('Token').at(apps[1].proxy);
      vault = await getContract('Vault').at(apps[0].proxy);
      (await Promise.all([
        contribution.hasInitialized(),
        contributor.hasInitialized(),
        proposal.hasInitialized(),
        token.hasInitialized(),
        vault.hasInitialized(),
      ])).should.deep.equal([true, true, true, true, true]);
    });

    it('it should set permissions', async () => {
      kernel = await getContract('Kernel').at(address);
      (await Promise.all([
        //check contribution app roles
        kernel.hasPermission(accounts[0], contribution.address, await space.ADD_CONTRIBUTION_ROLE(), '0x0'),
        kernel.hasPermission(accounts[0], contribution.address, await space.VETO_CONTRIBUTION_ROLE(), '0x0'),
        kernel.hasPermission(proposal.address, contribution.address, await space.ADD_CONTRIBUTION_ROLE(), '0x0'),
        //proposal app roles
        kernel.hasPermission(accounts[0], proposal.address, await proposal.VOTE_PROPOSAL_ROLE(), '0x0'),
        //token app roles
        kernel.hasPermission(accounts[0], token.address, await token.MINT_TOKEN_ROLE(), '0x0'),
        kernel.hasPermission(contribution.address, token.address, await token.MINT_TOKEN_ROLE(), '0x0'),
        //vaul app roles
        kernel.hasPermission(accounts[0], vault.address, await vault.TRANSFER_ROLE(), '0x0'),
      ])).should.deep.equal([true, true, true, true, true, true, true]);
    });

  });
});
