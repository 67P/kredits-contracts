pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import './upgradeable/Upgradeable.sol';

// ToDo: only load interfaces
import './Token.sol';

contract Contribution is Upgradeable, ERC721Token {

  struct Contribution {
    address contributor;
    uint amount;
    bool issued;
    uint proposalId;
    string url;
    uint256 claimAfterBlock;
    bool exists;
  }
  string internal name_;
  string internal symbol_;

  mapping(uint256 => string) contributionURIs;

  mapping(uint256 => address) contributionOwner;
  mapping(address => uint256[]) ownedContributions;

  mapping(uint256 => Contribution) public contributions;
  uint256 public contributionsCount;

  event ContributionAdded(uint256 id, address indexed contributor, uint256 amount);

  function tokenContract() view public returns (Token) {
    return Token(registry.getProxyFor('Token'));
  }

  function name() external view returns (string) {
    return name_;
  }

  function symbol() external view returns (string) {
    return symbol_;
  }

  function contributionURI(uint256 contributionId) public view returns (string) {
    require(exists(contributionId));
    return contributions[contributionId].url;
  }

  function ownerOf(uint256 contributionId) public view returns (address) {
    require(exists(contributionId));
    return contributions[contributionId].contributor;
  }

  function balanceOf(address contributor) public view returns (uint) {
    return ownedContributions[contributor].length;
  }

  function add(uint256 amount, uint256 proposalId, address contributor, uint256 blocksToWait, string url) public {
    uint contributionId = contributionsCount + 1;
    var c = contributions[contributionId];
    c.exists = true;
    c.amount = amount;
    c.issued = false;
    c.proposalId = proposalId;
    c.url = url;
    c.contributor = contributor;
    c.claimAfterBlock = block.number + blocksToWait;

    contributionsCount++;

    contributionOwner[contributionId] = contributor;
    ownedContributions[contributor].push(contributionId);

    ContributionAdded(contributionId, contributor, amount);
  }

  function claim(uint256 contributionId) public {
    var c = contributions[contributionId];
    require(c.exists);
    require(!c.issued);
    require(block.number > c.claimAfterBlock);
    tokenContract().mintFor(c.contributor, c.amount, contributionId);
    c.issued = true;
  }

  function exists(uint256 contributionId) view public returns (bool) {
    return contributions[contributionId].exists;
  }


}
