const namehash = require('ethers').utils.namehash;

// eslint-disable-next-line no-undef
const Token = artifacts.require("Token.sol");

// eslint-disable-next-line no-undef
const getContract = name => artifacts.require(name);
const { assertRevert } = require('@aragon/test-helpers/assertThrow');

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

contract('Token app', (accounts) => {
  let kernelBase, aclBase, daoFactory, dao, r, acl, token;

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

    //get new app instance from DAO
    const receipt = await dao.newAppInstance(
      '0x1234',
      (await Token.new()).address,
      0x0,
      false,
      { from: root }
    );
    token = Token.at(
      receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy
    );

    //apps id
    let appsId = [];
    appsId[0] = namehash("kredits-contribution");
    appsId[1] = namehash("kredits-contributor");
    appsId[2] = namehash("kredits-proposal");
    appsId[3] = namehash("kredits-token");

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
  
  });

  describe("Owner default space permissions", async () => {
    it('check owner is token issuer', async () => {
      let tokenIssuerPermission = await acl.hasPermission(root, token.address, await token.MINT_TOKEN_ROLE());
      // eslint-disable-next-line no-undef
      assert.equal(tokenIssuerPermission, true);
    });  
  });

  describe("Token issuing", async () => {
    let name = "Kredits";
    let symbol = "₭S";
    let decimals = 18;

    it("check token properties", async () => {
      assert.equal(await token.name(), name); // eslint-disable-line no-undef
      assert.equal(await token.symbol(), symbol); // eslint-disable-line no-undef
      assert.equal(await token.decimals(), decimals); // eslint-disable-line no-undef
    });

  });

  describe("Token minting", async () => {
    let tokenToMint = 250;
    let ether = 1000000000000000000;

    it("should revert when mint tokens from an address that does not have minting permission", async () => {
      return assertRevert(async () => {
        await token.mintFor(root, tokenToMint, 1, { from: member1});
        'address does not have permission to mint tokens';
      });
    });

    it("should revert when mint tokens to address(0)", async () => {
      return assertRevert(async () => {
        await token.mintFor(ZERO_ADDR, tokenToMint, 1, { from: root});
        'invalid contributor address';
      });
    });

    it("should revert when mint amount of tokens equal to 0", async () => {
      return assertRevert(async () => {
        await token.mintFor(root, 0, 1, { from: root});
        'amount to mint should be greater than zero';
      });
    });

    it("mint tokens", async () => {
      await token.mintFor(root, tokenToMint, 1, { from: root });
      let ownerBalance = await token.balanceOf(root);
      let totalSupply = await token.totalSupply();
      assert.equal(ownerBalance.toNumber(), tokenToMint*ether); // eslint-disable-line no-undef
      assert.equal(totalSupply.toNumber(), tokenToMint*ether);  // eslint-disable-line no-undef
    });
  });
});
