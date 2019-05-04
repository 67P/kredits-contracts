module.exports = {
    Contribution: artifacts.require('Contribution.sol'),
    getContributionContract: name => artifacts.require(name)
}
  