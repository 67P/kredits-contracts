pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/kernel/IKernel.sol";

contract Reimbursement is AragonApp {
  bytes32 public constant ADD_REIMBURSEMENT_ROLE = keccak256("ADD_REIMBURSEMENT_ROLE");
  bytes32 public constant VETO_REIMBURSEMENT_ROLE = keccak256("VETO_REIMBURSEMENT_ROLE");
  // bytes32 public constant MANAGE_APPS_ROLE = keccak256("MANAGE_APPS_ROLE");

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

  function initialize() public onlyInit {
    blocksToWait = 40320; // 7 days; 15 seconds block time
    initialized();
  }

  // function setApps() public isInitialized auth(MANAGE_APPS_ROLE) {
  // }

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

  function add(uint256 amount, address token, uint32 recipientId, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize) public isInitialized auth(ADD_REIMBURSEMENT_ROLE) {
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

  function veto(uint32 reimbursementId) public isInitialized auth(VETO_REIMBURSEMENT_ROLE) {
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
