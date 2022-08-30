const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
let owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7;
let Contribution, Contributor, Token;

describe("Contributor contract", async function () {
  before(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] = await ethers.getSigners();

    const contributorFactory = await ethers.getContractFactory("Contributor");
    Contributor = await upgrades.deployProxy(contributorFactory);
    const contributionFactory = await ethers.getContractFactory("Contribution");
    Contribution = await upgrades.deployProxy(contributionFactory, [40321]);
    const tokenFactory = await ethers.getContractFactory("Token");
    Token = await upgrades.deployProxy(tokenFactory);

    await Contributor.setTokenContract(Token.address);
    await Contributor.setContributionContract(Contribution.address);
    await Contribution.setContributorContract(Contributor.address);
    await Token.setContributorContract(Contributor.address);

    let accounts = [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7];
    for (const account of accounts) {
      await Contributor.addContributor(account.address, "0x99b8afd7b266e19990924a8be9099e81054b70c36b20937228a77a5cf75723b8", 18, 32);
    }
  });

  describe("initialize()", function () {
    it("sets the deployer address", async function () {
      expect(await Contributor.deployer()).to.equal(owner.address);
      expect(await Contributor.deployer()).to.not.equal(addr1.address);
    });
  });

  describe("add()", function () {
    it("does not allow random accounts to create a contributor profile", async function () {
      await expect(Contributor.connect(addr7).addContributor(
        "0x608FD4b95116Ea616990Aaeb1d4f1ce07612f261",
        "0x1d9de6de5c72eedca6d7a5e8a9159e2f5fe676506aece3000acefcc821723429",
        18, 32
      )).to.be.revertedWith("Core only");
      expect(await Contributor.contributorsCount()).to.equal(8);
    });

    it("allows core contributors to create a contributor profile", async function () {
      await Contributor.connect(addr1).addContributor(
        "0x608FD4b95116Ea616990Aaeb1d4f1ce07612f261",
        "0x1d9de6de5c72eedca6d7a5e8a9159e2f5fe676506aece3000acefcc821723429",
        18, 32
      );
      expect(await Contributor.contributorsCount()).to.equal(9);
      const c = await Contributor.getContributorById(9);
      expect(c['account']).to.equal("0x608FD4b95116Ea616990Aaeb1d4f1ce07612f261");
      expect(c['kreditsWithdrawn']).to.equal(0);
    });

    it("does not allow to create accounts with an existing address", async function () {
      await expect(Contributor.connect(addr1).addContributor(
        "0x608FD4b95116Ea616990Aaeb1d4f1ce07612f261",
        "0x1d9de6de5c72eedca6d7a5e8a9159e2f5fe676506aece3000acefcc821723429",
        18, 32
      )).to.be.revertedWith("Address already in use");
      expect(await Contributor.contributorsCount()).to.equal(9);
    });

    it("emits a ContributorAdded event", async function () {
      await expect(Contributor.connect(addr1).addContributor(
        "0x765E88b4F9a59C3a3b300C6eFF9E6E9fDDf9FbD9",
        "0xcfbeeadc244dfdc55bbad50d431871439df067970db84c73023956c96a6f5df2",
        18, 32
      )).to.emit(Contributor, "ContributorAdded").withArgs(10, "0x765E88b4F9a59C3a3b300C6eFF9E6E9fDDf9FbD9");
    });
  });

  describe("withdraw()", function () {
    before(async function () {
      // Add some pre-confirmed contributions (confirmedAtBlock 1)
      await Contribution.add(
        1500, 2, "0xe794f010e617449719c64076546254129f63a6d16cf200031afa646aeb35777f",
        18, 32, 1, false
      );
      await Contribution.add(
        5000, 2, "0xe794f010e617449719c64076546254129f63a6d16cf200031afa646aeb35777f",
        18, 32, 1, false
      );
      await Contribution.finishMigration();
    });

    it("requires the transaction sender to be a contributor", async function () {
      await expect(Contributor.withdraw()).to.be.revertedWith("Contributors only");
    });

    it("executes a withdrawal of all available ERC20 kredits", async function () {
      let c = await Contributor.getContributorById(2);
      expect(c['balance']).to.equal(0);
      await Contributor.connect(addr1).withdraw();
      c = await Contributor.getContributorById(2);
      expect(c['balance'].toString()).to.equal("6500000000000000000000");
      expect(c['kreditsWithdrawn']).to.equal(6500);
    });

    it("requires the withdrawable amount to be larger than 0", async function () {
      await expect(Contributor.connect(addr1).withdraw()).to.be.revertedWith("No kredits available");
    });
  });
});
