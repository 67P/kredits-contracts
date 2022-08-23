const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
let owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7;
let Contribution, Contributor;

describe("Contribution contract", async function () {
  before(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] = await ethers.getSigners();
    let accounts = [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7];
    const contributorFactory = await ethers.getContractFactory("Contributor");
    Contributor = await upgrades.deployProxy(contributorFactory);
    for (const account of accounts) {
      await Contributor.addContributor(account.address, "0x99b8afd7b266e19990924a8be9099e81054b70c36b20937228a77a5cf75723b8", 18, 32);
    }
  });

  describe("Deployment", function () {
    before(async function () {
      // const [owner] = await ethers.getSigners();
      const contributionFactory = await ethers.getContractFactory("Contribution");
      Contribution = await upgrades.deployProxy(contributionFactory, [40321]);
    });

    it("sets the veto confirmation period", async function () {
      expect(await Contribution.blocksToWait()).to.equal(40321);
    });

    it("sets the data migration flag", async function () {
      expect(await Contribution.migrationDone()).to.equal(false);
    });

    it("sets the deployer address", async function () {
      expect(await Contribution.deployer()).to.equal(owner.address);
      expect(await Contribution.deployer()).to.not.equal(addr1.address);
    });
  });

  describe("Data migration", function () {
    before(async function () {
      const contributionFactory = await ethers.getContractFactory("Contribution");
      Contribution = await upgrades.deployProxy(contributionFactory, [40321]);
      await Contribution.setContributorContract(Contributor.address).then(res => res.wait())
    });

    it("does not allow random accounts to mark the migration as finished", async function () {
      await expect(Contribution.connect(addr1).finishMigration()).to.be.revertedWith("Deployer only");
      expect(await Contribution.migrationDone()).to.equal(false);
    });

    it("allows the deployer to mark the migration as finished", async function () {
      await Contribution.finishMigration();
      expect(await Contribution.migrationDone()).to.equal(true);
    });
  });

});
