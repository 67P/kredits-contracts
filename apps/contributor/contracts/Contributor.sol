pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/kernel/IKernel.sol";

interface ITokenBalance {
  function balanceOf(address contributorAccount) public view returns (uint256);
}

contract Contributor is AragonApp {
  bytes32 public constant KERNEL_APP_ADDR_NAMESPACE = 0xd6f028ca0e8edb4a8c9757ca4fdccab25fa1e0317da1188108f7d2dee14902fb;
  bytes32 public constant MANAGE_CONTRIBUTORS_ROLE = keccak256("MANAGE_CONTRIBUTORS_ROLE");

  struct Contributor {
    address account;
    bytes32 hashDigest;
    uint8 hashFunction;
    uint8 hashSize;
    bool exists;
  }

  mapping (address => uint32) public contributorIds;
  mapping (uint32 => Contributor) public contributors;
  uint32 public contributorsCount;

  // ensure alphabetic order
  enum Apps { Contribution, Contributor, Proposal, Token }
  bytes32[4] public appIds;

  event ContributorProfileUpdated(uint32 id, bytes32 oldHashDigest, bytes32 newHashDigest); // what should be logged
  event ContributorAccountUpdated(uint32 id, address oldAccount, address newAccount);
  event ContributorAdded(uint32 id, address account);

  function initialize(address root,bytes32[4] _appIds) public onlyInit {
    appIds = _appIds;

    initialized();
  }

  function getTokenContract() public view returns (address) {
    IKernel k = IKernel(kernel());

    return k.getApp(KERNEL_APP_ADDR_NAMESPACE, appIds[uint8(Apps.Token)]);
  }

  function coreContributorsCount() view public returns (uint32) {
    uint32 count = 0;
    for (uint32 i = 1; i <= contributorsCount; i++) {
      if (isCoreTeam(i)) {
        count += 1;
      }
    }
    return count;
  }

  function updateContributorAccount(uint32 id, address oldAccount, address newAccount) public auth(MANAGE_CONTRIBUTORS_ROLE) {
    require(newAccount != address(0), "invalid new account address");
    require(getContributorAddressById(id) == oldAccount, "contributor does not exist");
    
    contributorIds[oldAccount] = 0;
    contributorIds[newAccount] = id;
    contributors[id].account = newAccount;

    emit ContributorAccountUpdated(id, oldAccount, newAccount);
  }

  function updateContributorProfileHash(uint32 id, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize) public isInitialized auth(MANAGE_CONTRIBUTORS_ROLE) {
    Contributor storage c = contributors[id];
    bytes32 oldHashDigest = c.hashDigest;
    c.hashDigest = hashDigest;
    c.hashFunction = hashFunction;
    c.hashSize = hashSize;

    ContributorProfileUpdated(id, oldHashDigest, c.hashDigest);
  }

  function addContributor(address account, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize) public isInitialized auth(MANAGE_CONTRIBUTORS_ROLE) {
    require(!addressExists(account));
    uint32 _id = contributorsCount + 1;
    assert(!contributors[_id].exists); // this can not be acually
    Contributor storage c = contributors[_id];
    c.exists = true;
    c.hashDigest = hashDigest;
    c.hashFunction = hashFunction;
    c.hashSize = hashSize;
    c.account = account;
    contributorIds[account] = _id;

    contributorsCount += 1;
    emit ContributorAdded(_id, account);
  }

  function isCoreTeam(uint32 id) view public returns (bool) {
    // TODO: for simplicity we simply define the first contributors as core
    // later this needs to be changed to something more dynamic
    return id < 7;
  }

  function exists(uint32 id) view public returns (bool) {
    return contributors[id].exists;
  }

  function addressIsCore(address account) view public returns (bool) {
    uint32 id = getContributorIdByAddress(account);
    return isCoreTeam(id);
  }

  function addressExists(address account) view public returns (bool) {
    return getContributorByAddress(account).exists;
  }

  function getContributorIdByAddress(address account) view public returns (uint32) {
    return contributorIds[account];
  }

  function getContributorAddressById(uint32 id) view public returns (address) {
    return contributors[id].account;
  }

  function getContributorByAddress(address account) internal view returns (Contributor) {
    uint32 id = contributorIds[account];
    return contributors[id];
  }

  function getContributorById(uint32 _id) public view returns (uint32 id, address account, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize, bool isCore, uint256 balance, bool exists ) {
    id = _id;
    Contributor storage c = contributors[_id];
    account = c.account;
    hashDigest = c.hashDigest;
    hashFunction = c.hashFunction;
    hashSize = c.hashSize;
    isCore = isCoreTeam(id);
    address token = getTokenContract();
    balance = ITokenBalance(token).balanceOf(c.account);
    exists = c.exists;
  }

  function canPerform(address _who, address _where, bytes32 _what/*, uint256[] memory _how*/) public returns (bool) {
    address sender = _who;
    if (sender == address(-1)) {
      sender = tx.origin;
    }
    // _what == keccak256('VOTE_PROPOSAL_ROLE')
    if (_what == 0xd61216798314d2fc33e42ff2021d66707b1e38517d3f7166798a9d3a196a9c96) {
      return contributorIds[sender] != uint256(0);
    }

    return addressIsCore(sender);
  }
}
