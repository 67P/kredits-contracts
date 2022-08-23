const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
let hardhatContribution;

describe("Contribution contract", function () {

  describe("Deployment", function () {
    before(async function () {
      // const [owner] = await ethers.getSigners();
      const Contribution = await ethers.getContractFactory("Contribution");
      hardhatContribution = await upgrades.deployProxy(Contribution, [40321]);
    });

    it("sets the veto confirmation period", async function () {
      expect(await hardhatContribution.blocksToWait()).to.equal(40321);
    });
  });

});
