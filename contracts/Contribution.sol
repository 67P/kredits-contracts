pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface IToken {
  function mintFor(address contributorAccount, uint256 amount, uint32 contributionId) external;
}

interface ContributorInterface {
  function getContributorAddressById(uint32 contributorId) external view returns (address);
  function getContributorIdByAddress(address contributorAccount) external view returns (uint32);
  // TODO Maybe use for validation
  // function exists(uint32 contributorId) public view returns (bool);
}

contract Contribution is Initializable {
  ContributorInterface public contributorContract;
  IToken public tokenContract;

  bytes32 public constant ADD_CONTRIBUTION_ROLE = keccak256("ADD_CONTRIBUTION_ROLE");
  bytes32 public constant VETO_CONTRIBUTION_ROLE = keccak256("VETO_CONTRIBUTION_ROLE");

  bytes32 public constant KERNEL_APP_ADDR_NAMESPACE = 0xd6f028ca0e8edb4a8c9757ca4fdccab25fa1e0317da1188108f7d2dee14902fb;

  struct ContributionData {
    uint32 contributorId;
    uint32 amount;
    bool claimed;
    bytes32 hashDigest;
    uint8 hashFunction;
    uint8 hashSize;
    string tokenMetadataURL;
    uint256 confirmedAtBlock;
    bool vetoed;
    bool exists;
  }

  string internal name_;
  string internal symbol_;

  // map contribution ID to contributor
  mapping(uint32 => uint32) public contributionOwner;
  // map contributor to contribution IDs
  mapping(uint32 => uint32[]) public ownedContributions;

  mapping(uint32 => ContributionData) public contributions;
  uint32 public contributionsCount;

  uint32 public blocksToWait;

  event ContributionAdded(uint32 id, uint32 indexed contributorId, uint32 amount);
  event ContributionClaimed(uint32 id, uint32 indexed contributorId, uint32 amount);
  event ContributionVetoed(uint32 id, address vetoedByAccount);

  function initialize(uint32 blocksToWait_) public initializer {
    blocksToWait = blocksToWait_;
  }

  // TODO who can call this when?
  function setTokenContract(address token) public {
    tokenContract = IToken(token);
  }

  // TODO who can call this when?
  function setContributorContract(address contributor) public {
    contributorContract = ContributorInterface(contributor);
  }

  function getContributorIdByAddress(address contributorAccount) public view returns (uint32) {
    return contributorContract.getContributorIdByAddress(contributorAccount);
  }

  function getContributorAddressById(uint32 contributorId) public view returns (address) {
    return contributorContract.getContributorAddressById(contributorId);
  }

  //
  // Token standard functions (ERC 721)
  //

  function name() external view returns (string memory) {
    return name_;
  }

  function symbol() external view returns (string memory) {
    return symbol_;
  }

  // Balance is amount of ERC271 tokens, not amount of kredits
  function balanceOf(address owner) public view returns (uint256) {
    require(owner != address(0));
    uint32 contributorId = getContributorIdByAddress(owner);
    return ownedContributions[contributorId].length;
  }

  function ownerOf(uint32 contributionId) public view returns (address) {
    require(exists(contributionId));
    uint32 contributorId = contributions[contributionId].contributorId;
    return getContributorAddressById(contributorId);
  }

  function tokenOfOwnerByIndex(address owner, uint32 index) public view returns (uint32) {
    uint32 contributorId = getContributorIdByAddress(owner);
    return ownedContributions[contributorId][index];
  }

  function tokenMetadata(uint32 contributionId) public view returns (string memory) {
    return contributions[contributionId].tokenMetadataURL;
  }

  //
  // Custom functions
  //

  function totalKreditsEarned(bool confirmedOnly) public view returns (uint32 amount) {
    for (uint32 i = 1; i <= contributionsCount; i++) {
      ContributionData memory c = contributions[i];
      if (!c.vetoed && (block.number >= c.confirmedAtBlock || !confirmedOnly)) {
        amount += c.amount; // should use safemath
      }
    }
  }

  function totalKreditsEarnedByContributor(uint32 contributorId, bool confirmedOnly) public view returns (uint32 amount) {
    uint256 tokenCount = ownedContributions[contributorId].length;
    for (uint256 i = 0; i < tokenCount; i++) {
      uint32 cId = ownedContributions[contributorId][i];
      ContributionData memory c = contributions[cId];
      if (!c.vetoed && (block.number >= c.confirmedAtBlock || !confirmedOnly)) {
        amount += c.amount; // should use safemath
      }
    }
  }

  function getContribution(uint32 contributionId) public view returns (uint32 id, uint32 contributorId, uint32 amount, bool claimed, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize, uint256 confirmedAtBlock, bool exists, bool vetoed) {
    id = contributionId;
    ContributionData storage c = contributions[id];
    return (
      id,
      c.contributorId,
      c.amount,
      c.claimed,
      c.hashDigest,
      c.hashFunction,
      c.hashSize,
      c.confirmedAtBlock,
      c.exists,
      c.vetoed
    );
  }

  function add(uint32 amount, uint32 contributorId, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize) public{
    //require(canPerform(msg.sender, ADD_CONTRIBUTION_ROLE, new uint32[](0)), 'nope');
    uint32 contributionId = contributionsCount + 1;
    ContributionData storage c = contributions[contributionId];
    c.exists = true;
    c.amount = amount;
    c.claimed = false;
    c.contributorId = contributorId;
    c.hashDigest = hashDigest;
    c.hashFunction = hashFunction;
    c.hashSize = hashSize;
    if (contributionId < 10) {
      c.confirmedAtBlock = block.number;
    } else {
      c.confirmedAtBlock = block.number + 1 + blocksToWait;
    }

    contributionsCount++;

    contributionOwner[contributionId] = contributorId;
    ownedContributions[contributorId].push(contributionId);

    emit ContributionAdded(contributionId, contributorId, amount);
  }

  function veto(uint32 contributionId) public {
    ContributionData storage c = contributions[contributionId];
    require(c.exists, 'NOT_FOUND');
    require(!c.claimed, 'ALREADY_CLAIMED');
    require(block.number < c.confirmedAtBlock, 'VETO_PERIOD_ENDED');
    c.vetoed = true;

    emit ContributionVetoed(contributionId, msg.sender);
  }

  function claim(uint32 contributionId) public {
    ContributionData storage c = contributions[contributionId];
    require(c.exists, 'NOT_FOUND');
    require(!c.claimed, 'ALREADY_CLAIMED');
    require(!c.vetoed, 'VETOED');
    require(block.number >= c.confirmedAtBlock, 'NOT_CLAIMABLE');

    c.claimed = true;
    address contributorAccount = getContributorAddressById(c.contributorId);
    uint256 amount = uint256(c.amount);
    tokenContract.mintFor(contributorAccount, amount, contributionId);
    emit ContributionClaimed(contributionId, c.contributorId, c.amount);
  }

  function exists(uint32 contributionId) public view returns (bool) {
    return contributions[contributionId].exists;
  }
}
