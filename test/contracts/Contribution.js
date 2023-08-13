const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
let owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7;
let Contribution, Contributor;

describe("Contribution contract", async function () {
  before(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] = await ethers.getSigners();
    let accounts = [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7];
    const contributorFactory = await ethers.getContractFactory("Contributor");
    Contributor = await upgrades.deployProxy(contributorFactory, ["0x2946fFfd31096435cb0fc927D306E1C006C5D1aF"]);
    for (const account of accounts) {
      await Contributor.addContributor(account.address, "0x99b8afd7b266e19990924a8be9099e81054b70c36b20937228a77a5cf75723b8", 18, 32);
    }
  });

  describe("initialize()", function () {
    before(async function () {
      // const [owner] = await ethers.getSigners();
      const contributionFactory = await ethers.getContractFactory("Contribution");
      Contribution = await upgrades.deployProxy(contributionFactory, [40321]);
    });

    it("sets the veto confirmation period", async function () {
      expect(await Contribution.blocksToWait()).to.equal(40321);
    });

    it("sets the data migration flag", async function () {
      expect(await Contribution.migrationDone()).to.be.false;
    });

    it("sets the deployer address", async function () {
      expect(await Contribution.deployer()).to.equal(owner.address);
      expect(await Contribution.deployer()).to.not.equal(addr1.address);
    });
  });

  describe("finishMigration()", function () {
    before(async function () {
      const contributionFactory = await ethers.getContractFactory("Contribution");
      Contribution = await upgrades.deployProxy(contributionFactory, [40321]);
      await Contribution.setContributorContract(Contributor.address).then(res => res.wait())
    });

    it("does not allow random accounts to mark the migration as finished", async function () {
      await expect(Contribution.connect(addr1).finishMigration()).to.be.revertedWith("Deployer only");
      expect(await Contribution.migrationDone()).to.be.false;
    });

    it("allows the deployer to mark the migration as finished", async function () {
      await Contribution.finishMigration();
      expect(await Contribution.migrationDone()).to.equal(true);
    });
  });

  describe("add()", function () {
    before(async function () {
      const contributionFactory = await ethers.getContractFactory("Contribution");
      Contribution = await upgrades.deployProxy(contributionFactory, [40321]);
      await Contribution.setContributorContract(Contributor.address).then(res => res.wait())
      await Contribution.finishMigration();
    });

    it("does not allow non-contributors to add a contribution", async function () {
      await expect(Contribution.connect(addr7).add(
        500, 1,
        "0xe794f010e617449719c64076546254129f63a6d16cf200031afa646aeb35777f",
        18, 32, 0, false
      )).to.be.revertedWith("Requires kredits or core status");
      expect(await Contribution.contributionsCount()).to.equal(0);
    });

    it("does not allow special arguments outside of a migration", async function () {
      await expect(Contribution.connect(addr7).add(
        500, 1,
        "0xe794f010e617449719c64076546254129f63a6d16cf200031afa646aeb35777f",
        18, 32, 23000, true
      )).to.be.revertedWith("Extra arguments not allowed");
      expect(await Contribution.contributionsCount()).to.equal(0);
    });

    it("allows core contributors to add a contribution", async function () {
      await Contribution.connect(addr2).add(
        2001, 1,
        "0xe794f010e617449719c64076546254129f63a6d16cf200031afa646aeb35777f",
        18, 32, 0, false
      );
      expect(await Contribution.contributionsCount()).to.equal(1);
    });

    it("allows contributors to add a contribution", async function () {
      // Issue some kredits for new contributor #8 (addr7)
      await Contribution.connect(addr1).add(
        5000, 8,
        "0xe794f010e617449719c64076546254129f63a6d16cf200031afa646aeb35777f",
        18, 32, 0, false
      );
      await Contribution.connect(addr7).add(
        1500, 1,
        "0xe794f010e617449719c64076546254129f63a6d16cf200031afa646aeb35777f",
        18, 32, 0, false
      );
      expect(await Contribution.contributionsCount()).to.equal(3);
    });

    it("sets confirmedAtBlock to current block plus blocksToWait", async function () {
      await Contribution.connect(addr1).add(
        500, 3,
        "0xe794f010e617449719c64076546254129f63a6d16cf200031afa646aeb35777f",
        18, 32, 0, false
      );
      expect(await Contribution.contributionsCount()).to.equal(4);
      const c = await Contribution.getContribution(4);
      const currentBlockNumber = await kredits.provider.getBlockNumber();
      expect(c['confirmedAtBlock']).to.equal(currentBlockNumber + 1 + 40321);
    });

    it("emits a ContributionAdded event", async function () {
      await expect(Contribution.connect(addr1).add(
        2001, 1,
        "0xe794f010e617449719c64076546254129f63a6d16cf200031afa646aeb35777f",
        18, 32, 0, false
      )).to.emit(Contribution, "ContributionAdded").withArgs(anyValue, 1, 2001);
    });

    describe("with extra arguments during migration", async function () {
      before(async function () {
        const contributionFactory = await ethers.getContractFactory("Contribution");
        Contribution = await upgrades.deployProxy(contributionFactory, [40321]);
        await Contribution.setContributorContract(Contributor.address);
      });

      it("allows to add a contribution with custom confirmedAtBlock", async function () {
        await Contribution.connect(addr2).add(
          2001, 1,
          "0xe794f010e617449719c64076546254129f63a6d16cf200031afa646aeb35777f",
          18, 32, 23000, false
        );
        expect(await Contribution.contributionsCount()).to.equal(1);
        const c = await Contribution.getContribution(1);
        expect(c['confirmedAtBlock'].toNumber()).to.equal(23000);
      });

      it("allows to add a vetoed contribution", async function () {
        await Contribution.connect(addr2).add(
          2001, 1,
          "0xe794f010e617449719c64076546254129f63a6d16cf200031afa646aeb35777f",
          18, 32, 23000, true
        );
        expect(await Contribution.contributionsCount()).to.equal(2);
        const c = await Contribution.getContribution(2);
        expect(c['vetoed']).to.be.true;
      });
    });
  });
});
