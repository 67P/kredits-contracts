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

  event ReimbursementAdded(uint32 id, address indexed addedByAccount, uint256 amount);
  event ReimbursementVetoed(uint32 id, address vetoedByAccount);

  function initialize() public initializer {
    blocksToWait = 40320; // 7 days; 15 seconds block time
  }

  modifier onlyCore {
    require(contributorContract.addressIsCore(msg.sender), "Core only");
    _;
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

  function add(uint256 amount, address token, uint32 recipientId, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize) public onlyCore {
    uint32 reimbursementId = reimbursementsCount + 1;
    ReimbursementData storage r = reimbursements[reimbursementId];
    r.exists = true;
    r.amount = amount;
    r.token = token;
    r.recipientId = recipientId;
    r.hashDigest = hashDigest;
    r.hashFunction = hashFunction;
    r.hashSize = hashSize;
    r.confirmedAtBlock = block.number + blocksToWait;

    reimbursementsCount++;

    emit ReimbursementAdded(reimbursementId, msg.sender, amount);
  }

  function veto(uint32 reimbursementId) public onlyCore {
    ReimbursementData storage r = reimbursements[reimbursementId];
    require(r.exists, 'NOT_FOUND');
    require(block.number < r.confirmedAtBlock, 'VETO_PERIOD_ENDED');
    r.vetoed = true;

    emit ReimbursementVetoed(reimbursementId, msg.sender);
  }

  function exists(uint32 reimbursementId) public view returns (bool) {
    return reimbursements[reimbursementId].exists;
  }
}
