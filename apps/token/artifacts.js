module.exports = {
    Token: artifacts.require('Token.sol'),
    getTokenContract: name => artifacts.require(name)
}
  