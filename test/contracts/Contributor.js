const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
let owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7;
let Contribution, Contributor;

describe("Contributor contract", async function () {
  before(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] = await ethers.getSigners();
    // let accounts = [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7];
    // const contributorFactory = await ethers.getContractFactory("Contributor");
    // Contributor = await upgrades.deployProxy(contributorFactory);
    // for (const account of accounts) {
    //   await Contributor.addContributor(account.address, "0x99b8afd7b266e19990924a8be9099e81054b70c36b20937228a77a5cf75723b8", 18, 32);
    // }
  });

  describe("initialize()", function () {
    before(async function () {
      // const [owner] = await ethers.getSigners();
      const contributorFactory = await ethers.getContractFactory("Contributor");
      Contributor = await upgrades.deployProxy(contributorFactory);
    });

    it("sets the deployer address", async function () {
      expect(await Contributor.deployer()).to.equal(owner.address);
      expect(await Contributor.deployer()).to.not.equal(addr1.address);
    });
  });
});
