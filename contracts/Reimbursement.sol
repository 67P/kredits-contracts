pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface ContributorInterface {
  function getContributorAddressById(uint32 contributorId) external view returns (address);
  function getContributorIdByAddress(address contributorAccount) external view returns (uint32);
  function addressIsCore(address sender) external view returns (bool);
  // TODO Maybe use for validation
  // function exists(uint32 contributorId) public view returns (bool);
}

contract Reimbursement is Initializable {
  ContributorInterface public contributorContract;

  struct ReimbursementData {
    uint32 recipientId;
    uint256 amount;
    // TODO remove token entirely
    address token;
    bytes32 hashDigest;
    uint8 hashFunction;
    uint8 hashSize;
    uint256 confirmedAtBlock;
    bool vetoed;
    bool exists;
  }

  mapping(uint32 => ReimbursementData) public reimbursements;
  uint32 public reimbursementsCount;

  uint32 public blocksToWait;

  // The address that deployed the contract
  address public deployer;

  // Data migration flag
  bool public migrationDone;

  event ReimbursementAdded(uint32 id, address indexed addedByAccount, uint256 amount);
  event ReimbursementVetoed(uint32 id, address vetoedByAccount);

  modifier onlyCore {
    require(contributorContract.addressIsCore(tx.origin), "Core only");
    _;
  }

  modifier onlyDeployer {
    require(msg.sender == deployer, "Deployer only");
    _;
  }

  function initialize() public initializer {
    deployer = msg.sender;
    migrationDone = false;
    blocksToWait = 40320; // 7 days; 15 seconds block time
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

  function totalAmount(bool confirmedOnly) public view returns (uint256 amount) {
    for (uint32 i = 1; i <= reimbursementsCount; i++) {
      ReimbursementData memory r = reimbursements[i];
      if (!r.vetoed && (block.number >= r.confirmedAtBlock || !confirmedOnly)) {
        amount += r.amount; // should use safemath
      }
    }
  }

  function get(uint32 reimbursementId) public view returns (uint32 id, uint32 recipientId, uint256 amount, address token, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize, uint256 confirmedAtBlock, bool exists, bool vetoed) {
    id = reimbursementId;
    ReimbursementData storage r = reimbursements[id];
    return (
      id,
      r.recipientId,
      r.amount,
      r.token,
      r.hashDigest,
      r.hashFunction,
      r.hashSize,
      r.confirmedAtBlock,
      r.exists,
      r.vetoed
    );
  }

  function add(uint256 amount, address token, uint32 recipientId, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize, uint256 confirmedAtBlock, bool vetoed) public onlyCore {
    require((confirmedAtBlock == 0 && vetoed == false) || migrationDone == false, "Extra arguments not allowed");
    uint32 reimbursementId = reimbursementsCount + 1;
    ReimbursementData storage r = reimbursements[reimbursementId];
    r.exists = true;
    r.amount = amount;
    r.token = token;
    r.recipientId = recipientId;
    r.hashDigest = hashDigest;
    r.hashFunction = hashFunction;
    r.hashSize = hashSize;

    if (confirmedAtBlock > 0) {
      r.confirmedAtBlock = confirmedAtBlock;
    } else {
      r.confirmedAtBlock = block.number + 1 + blocksToWait;
    }

    if (vetoed) { r.vetoed = true; }

    reimbursementsCount++;

    emit ReimbursementAdded(reimbursementId, msg.sender, amount);
  }

  function veto(uint32 reimbursementId) public onlyCore {
    ReimbursementData storage r = reimbursements[reimbursementId];
    require(r.exists, "NOT_FOUND");
    require(block.number < r.confirmedAtBlock, "VETO_PERIOD_ENDED");
    r.vetoed = true;

    emit ReimbursementVetoed(reimbursementId, msg.sender);
  }

  function exists(uint32 reimbursementId) public view returns (bool) {
    return reimbursements[reimbursementId].exists;
  }
}
