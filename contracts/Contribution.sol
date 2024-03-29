pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface ContributorInterface {
  function getContributorAddressById(uint32 contributorId) external view returns (address);
  function getContributorIdByAddress(address contributorAccount) external view returns (uint32);
  function addressIsCore(address sender) external view returns (bool);
  // TODO Maybe use for validation
  // function exists(uint32 contributorId) public view returns (bool);
}

contract Contribution is Initializable {
  ContributorInterface public contributorContract;

  struct ContributionData {
    uint32 contributorId;
    uint32 amount;
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

  // Confirmation veto period
  uint32 public blocksToWait;

  // The address that deployed the contract
  address public deployer;

  // Data migration flag
  bool public migrationDone;

  event ContributionAdded(uint32 id, uint32 indexed contributorId, uint32 amount);
  event ContributionVetoed(uint32 id, address vetoedByAccount);

  modifier onlyCore {
    require(contributorContract.addressIsCore(tx.origin), "Core only");
    _;
  }

  modifier onlyDeployer {
    require(msg.sender == deployer, "Deployer only");
    _;
  }

  function initialize(uint32 blocksToWait_) public initializer {
    deployer = msg.sender;
    migrationDone = false;
    blocksToWait = blocksToWait_;
  }

  function finishMigration() public onlyDeployer {
    migrationDone = true;
  }

  function setContributorContract(address contributor) public {
    require(address(contributorContract) == address(0) || contributorContract.addressIsCore(msg.sender), "Core only");
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
    require(owner != address(0), "Address invalid");
    uint32 contributorId = getContributorIdByAddress(owner);
    return ownedContributions[contributorId].length;
  }

  function ownerOf(uint32 contributionId) public view returns (address) {
    require(exists(contributionId), "Contribution does not exist");
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

  function getContribution(uint32 contributionId) public view returns (uint32 id, uint32 contributorId, uint32 amount, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize, uint256 confirmedAtBlock, bool exists, bool vetoed) {
    id = contributionId;
    ContributionData storage c = contributions[id];
    return (
      id,
      c.contributorId,
      c.amount,
      c.hashDigest,
      c.hashFunction,
      c.hashSize,
      c.confirmedAtBlock,
      c.exists,
      c.vetoed
    );
  }

  function add(uint32 amount, uint32 contributorId, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize, uint256 confirmedAtBlock, bool vetoed) public {
    require((confirmedAtBlock == 0 && vetoed == false) || migrationDone == false, "Extra arguments not allowed");
    require(balanceOf(msg.sender) > 0 || contributorContract.addressIsCore(msg.sender), "Requires kredits or core status");

    uint32 contributionId = contributionsCount + 1;
    ContributionData storage c = contributions[contributionId];
    c.exists = true;
    c.amount = amount;
    c.contributorId = contributorId;
    c.hashDigest = hashDigest;
    c.hashFunction = hashFunction;
    c.hashSize = hashSize;

    if (confirmedAtBlock > 0) {
      c.confirmedAtBlock = confirmedAtBlock;
    } else {
      c.confirmedAtBlock = block.number + 1 + blocksToWait;
    }

    if (vetoed) { c.vetoed = true; }

    contributionsCount++;

    contributionOwner[contributionId] = contributorId;
    ownedContributions[contributorId].push(contributionId);

    emit ContributionAdded(contributionId, contributorId, amount);
  }

  function veto(uint32 contributionId) public onlyCore {
    ContributionData storage c = contributions[contributionId];
    require(c.exists, "NOT_FOUND");
    require(block.number < c.confirmedAtBlock, "VETO_PERIOD_ENDED");
    c.vetoed = true;

    emit ContributionVetoed(contributionId, msg.sender);
  }

  function exists(uint32 contributionId) public view returns (bool) {
    return contributions[contributionId].exists;
  }
}
