module.exports = {
    Contributor: artifacts.require('Contributor.sol'),
    getContributorContract: name => artifacts.require(name)
}
  