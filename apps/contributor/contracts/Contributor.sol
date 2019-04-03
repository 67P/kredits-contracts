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
    bytes32 ipfsHash;
    uint8 hashFunction;
    uint8 hashSize;
    bool isCore;
    bool exists;
  }

  mapping (address => uint) public contributorIds;
  mapping (uint => Contributor) public contributors;
  uint256 public contributorsCount;

  // ensure alphabetic order
  enum Apps { Contribution, Contributor, Proposal, Token }
  bytes32[4] public appIds;

  event ContributorProfileUpdated(uint id, bytes32 oldIpfsHash, bytes32 newIpfsHash);
  event ContributorAccountUpdated(uint id, address oldAccount, address newAccount);
  event ContributorAdded(uint id, address account);

  function initialize(address root,bytes32[4] _appIds) public onlyInit {
    uint _id = contributorsCount + 1;
    Contributor storage c = contributors[_id];
    c.exists = true;
    c.isCore = true;
    c.account = root;
    contributorIds[root] = _id;
    contributorsCount += 1;

    appIds = _appIds;

    initialized();
  }

  function getTokenContract() public view returns (address) {
    IKernel k = IKernel(kernel());

    return k.getApp(KERNEL_APP_ADDR_NAMESPACE, appIds[uint8(Apps.Token)]);
  }

  function coreContributorsCount() view public returns (uint) {
    uint count = 0;
    for (uint256 i = 1; i <= contributorsCount; i++) {
      if (contributors[i].isCore) {
        count += 1;
      }
    }
    return count;
  }

  function updateContributorAccount(uint id, address oldAccount, address newAccount) public auth(MANAGE_CONTRIBUTORS_ROLE) {
    contributorIds[oldAccount] = 0;
    contributorIds[newAccount] = id;
    contributors[id].account = newAccount;
    ContributorAccountUpdated(id, oldAccount, newAccount);
  }

  function updateContributorIpfsHash(uint id, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize) public isInitialized auth(MANAGE_CONTRIBUTORS_ROLE) {
    Contributor storage c = contributors[id];
    bytes32 oldIpfsHash = c.ipfsHash;
    c.ipfsHash = ipfsHash;
    c.hashFunction = hashFunction;
    c.hashSize = hashSize;

    ContributorProfileUpdated(id, oldIpfsHash, c.ipfsHash);
  }

  function addContributor(address account, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize, bool isCore) public isInitialized auth(MANAGE_CONTRIBUTORS_ROLE) {
    require(!addressExists(account));
    uint _id = contributorsCount + 1;
    assert(!contributors[_id].exists); // this can not be acually
    Contributor storage c = contributors[_id];
    c.exists = true;
    c.isCore = isCore;
    c.ipfsHash = ipfsHash;
    c.hashFunction = hashFunction;
    c.hashSize = hashSize;
    c.account = account;
    contributorIds[account] = _id;

    contributorsCount += 1;
    emit ContributorAdded(_id, account);
  }

  function isCore(uint id) view public returns (bool) {
    return contributors[id].isCore;
  }

  function exists(uint id) view public returns (bool) {
    return contributors[id].exists;
  }

  function addressIsCore(address account) view public returns (bool) {
    return getContributorByAddress(account).isCore;
  }

  function addressExists(address account) view public returns (bool) {
    return getContributorByAddress(account).exists;
  }

  function getContributorIdByAddress(address account) view public returns (uint) {
    return contributorIds[account];
  }

  function getContributorAddressById(uint id) view public returns (address) {
    return contributors[id].account;
  }

  function getContributorByAddress(address account) internal view returns (Contributor) {
    uint id = contributorIds[account];
    return contributors[id];
  }

  function getContributorById(uint _id) public view returns (uint id, address account, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize, bool isCore, uint256 balance, bool exists ) {
    id = _id;
    Contributor storage c = contributors[_id];
    account = c.account;
    ipfsHash = c.ipfsHash;
    hashFunction = c.hashFunction;
    hashSize = c.hashSize;
    isCore = c.isCore;
    address token = getTokenContract();
    balance = ITokenBalance(token).balanceOf(c.account);
    exists = c.exists;
  }

  function canPerform(address _who, address _where, bytes32 _what, uint256[] _how) public view returns (bool) {
    return addressExists(_who);
  }
}
