pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import './upgradeable/Upgradeable.sol';

// ToDo: only load interfaces
import './Token.sol';
import './Contributors.sol';

contract Contribution is Upgradeable, ERC721Token {

  struct ContributionData {
    address contributor;
    uint amount;
    bool claimed;
    bytes32 hashDigest;
    uint8 hashFunction;
    uint8 hashSize;
    string tokenMetadataURL;
    uint claimAfterBlock;
    bool exists;
  }
  string internal name_;
  string internal symbol_;

  mapping(uint256 => address) contributionOwner;
  mapping(address => uint256[]) ownedContributions;

  mapping(uint256 => ContributionData) public contributions;
  uint256 public contributionsCount;

  event ContributionAdded(uint256 id, address indexed contributor, uint256 amount);
  event ContributionClaimed(uint256 id, address indexed contributor, uint256 amount);

  modifier coreOnly() { 
    require(contributorsContract().addressIsCore(msg.sender));
    _;
  }
  modifier contributorOnly() { 
    require(contributorsContract().addressExists(msg.sender));
    _;
  }
  
  function contributorsContract() view public returns (Contributors) {
    return Contributors(registry.getProxyFor('Contributors'));
  }

  function tokenContract() view public returns (Token) {
    return Token(registry.getProxyFor('Token'));
  }

  function name() external view returns (string) {
    return name_;
  }

  function symbol() external view returns (string) {
    return symbol_;
  }

  function ownerOf(uint256 contributionId) public view returns (address) {
    require(exists(contributionId));
    return contributions[contributionId].contributor;
  }

  function balanceOf(address contributor) public view returns (uint) {
    return ownedContributions[contributor].length;
  }

  function tokenOfOwnerByIndex(address contributor, uint index) public view returns (uint) {
    return ownedContributions[contributor][index];
  }

  function tokenMetadata(uint contributionId) public view returns (string) {
    return contributions[contributionId].tokenMetadataURL;
  }

  function getContribution(uint contributionId) public view returns (uint256 id, address contributor, uint256 amount, bool claimed, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize, uint claimAfterBlock, bool exists) {
    id = contributionId;
    ContributionData storage c = contributions[id];
    return (
      id,
      c.contributor,
      c.amount, 
      c.claimed, 
      c.hashDigest,
      c.hashFunction,
      c.hashSize,
      c.claimAfterBlock,
      c.exists
    );
  }

  function add(uint256 amount, address contributor, uint256 blocksToWait) public coreOnly {
    uint contributionId = contributionsCount + 1;
    ContributionData storage c = contributions[contributionId];
    c.exists = true;
    c.amount = amount;
    c.claimed = false;
    c.contributor = contributor;
    c.claimAfterBlock = block.number + blocksToWait;

    contributionsCount++;

    contributionOwner[contributionId] = contributor;
    ownedContributions[contributor].push(contributionId);
  
    ContributionAdded(contributionId, contributor, amount);
  }

  function claim(uint256 contributionId) public {
    ContributionData storage c = contributions[contributionId];
    require(c.exists);
    require(!c.claimed);
    require(block.number > c.claimAfterBlock);
    c.claimed = true;
    tokenContract().mintFor(c.contributor, c.amount, contributionId);
    
    ContributionClaimed(contributionId, c.contributor, c.amount);
  }

  function exists(uint256 contributionId) view public returns (bool) {
    return contributions[contributionId].exists;
  }


}
