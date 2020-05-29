pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/kernel/IKernel.sol";

contract Reimbursement is AragonApp {
  bytes32 public constant ADD_REIMBURSEMENT_ROLE = keccak256("ADD_REIMBURSEMENT_ROLE");
  bytes32 public constant VETO_REIMBURSEMENT_ROLE = keccak256("VETO_REIMBURSEMENT_ROLE");

  bytes32 public constant KERNEL_APP_ADDR_NAMESPACE = 0xd6f028ca0e8edb4a8c9757ca4fdccab25fa1e0317da1188108f7d2dee14902fb;

  // ensure alphabetic order
  enum Apps { Contribution, Contributor, Proposal, Reimbursement, Token }
  bytes32[5] public appIds;

  struct ReimbursementData {
    address recipient;
    uint256 amount;
    address token;
    bool claimed;
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

  event ReimbursementAdded(uint32 id, address indexed addedByAccont, uint256 amount);
  event ReimbursementClaimed(uint32 id, uint256 amount);
  event ReimbursementVetoed(uint32 id, address vetoedByAccount);

  function initialize(bytes32[5] _appIds) public onlyInit {
    appIds = _appIds;
    blocksToWait = 40320; // 7 days; 15 seconds block time
    initialized();
  }

  function getContract(uint8 appId) public view returns (address) {
    IKernel k = IKernel(kernel());
    return k.getApp(KERNEL_APP_ADDR_NAMESPACE, appIds[appId]);
  }

  function totalAmount(bool confirmedOnly) public view returns (uint256 amount) {
    for (uint32 i = 1; i <= reimbursementsCount; i++) {
      ReimbursementData memory r = reimbursements[i];
      if (!r.vetoed && (block.number >= r.confirmedAtBlock || !confirmedOnly)) {
        amount += r.amount; // should use safemath
      }
    }
  }

  function getReimbursement(uint32 reimbursementId) public view returns (uint32 id, address recipient, uint256 amount, address token, bool claimed, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize, uint256 confirmedAtBlock, bool exists, bool vetoed) {
    id = reimbursementId;
    ReimbursementData storage r = reimbursements[id];
    return (
      id,
      r.recipient,
      r.amount,
      r.token,
      r.claimed,
      r.hashDigest,
      r.hashFunction,
      r.hashSize,
      r.confirmedAtBlock,
      r.exists,
      r.vetoed
    );
  }

  function add(uint256 amount, address token, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize) public isInitialized auth(ADD_REIMBURSEMENT_ROLE) {
    uint32 reimbursementId = reimbursementsCount + 1;
    ReimbursementData storage r = reimbursements[reimbursementId];
    r.exists = true;
    r.amount = amount;
    r.token = token;
    r.claimed = false;
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
    require(!r.claimed, 'ALREADY_CLAIMED');
    require(block.number < r.confirmedAtBlock, 'VETO_PERIOD_ENDED');
    r.vetoed = true;

    emit ReimbursementVetoed(reimbursementId, msg.sender);
  }

  function claim(uint32 reimbursementId) public isInitialized {
    ReimbursementData storage r = reimbursements[reimbursementId];
    require(r.exists, 'NOT_FOUND');
    require(!r.claimed, 'ALREADY_CLAIMED');
    require(!r.vetoed, 'VETOED');
    require(block.number >= r.confirmedAtBlock, 'NOT_CLAIMABLE');

    r.claimed = true;
    // TODO
    // transfer using vault
    emit ReimbursementClaimed(reimbursementId, r.amount);
  }

  function exists(uint32 reimbursementId) public view returns (bool) {
    return reimbursements[reimbursementId].exists;
  }
}
