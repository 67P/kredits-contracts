pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";

contract Contributor is AragonApp {
  bytes32 public constant MANAGE_CONTRIBUTORS_ROLE = keccak256("MANAGE_CONTRIBUTORS_ROLE");

  struct Contributor {
    address account;
    bytes32 ipfsHash;
    uint8 hashFunction;
    uint8 hashSize;
    bool isCore;
    bool exists;
  }

  mapping (address => uint256) public contributorIds;
  mapping (uint256 => Contributor) public contributors;
  uint256 public contributorsCount;

  // ensure alphabetic order
  enum Apps { Contribution, Contributor, Proposal, Token }
  bytes32[4] public appIds;

  event ContributorProfileUpdated(uint256 id, bytes32 oldIpfsHash, bytes32 newIpfsHash);
  event ContributorAccountUpdated(uint256 id, address oldAccount, address newAccount);
  event ContributorAdded(uint256 id, address account);

  function initialize(address root,bytes32[4] _appIds) public onlyInit {
    uint256 _id = contributorsCount + 1;
    Contributor storage c = contributors[_id];
    c.exists = true;
    c.isCore = true;
    c.account = root;
    contributorIds[root] = _id;
    contributorsCount += 1;

    appIds = _appIds;

    initialized();
  }

  function coreContributorsCount() view public returns (uint256) {
    uint256 count = 0;
    for (uint256 i = 1; i <= contributorsCount; i++) {
      if (contributors[i].isCore) {
        count += 1;
      }
    }
    return count;
  }

  function updateContributorAccount(uint256 id, address oldAccount, address newAccount) public auth(MANAGE_CONTRIBUTORS_ROLE) {
    contributorIds[oldAccount] = 0;
    contributorIds[newAccount] = id;
    contributors[id].account = newAccount;
    ContributorAccountUpdated(id, oldAccount, newAccount);
  }

  function updateContributorIpfsHash(uint256 id, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize) public isInitialized auth(MANAGE_CONTRIBUTORS_ROLE) {
    Contributor storage c = contributors[id];
    bytes32 oldIpfsHash = c.ipfsHash;
    c.ipfsHash = ipfsHash;
    c.hashFunction = hashFunction;
    c.hashSize = hashSize;

    ContributorProfileUpdated(id, oldIpfsHash, c.ipfsHash);
  }

  function addContributor(address account, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize, bool isCore) public isInitialized auth(MANAGE_CONTRIBUTORS_ROLE) {
    require(!addressExists(account));
    uint256 _id = contributorsCount + 1;
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

  function isCore(uint256 id) view public returns (bool) {
    return contributors[id].isCore;
  }

  function exists(uint256 id) view public returns (bool) {
    return contributors[id].exists;
  }

  function addressIsCore(address account) view public returns (bool) {
    return getContributorByAddress(account).isCore;
  }

  function addressExists(address account) view public returns (bool) {
    return getContributorByAddress(account).exists;
  }

  function getContributorIdByAddress(address account) view public returns (uint256) {
    return contributorIds[account];
  }

  function getContributorAddressById(uint256 id) view public returns (address) {
    return contributors[id].account;
  }

  function getContributorByAddress(address account) internal view returns (Contributor) {
    uint256 id = contributorIds[account];
    return contributors[id];
  }

  function getContributorById(uint256 _id) public view returns (uint256 id, address account, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize, bool isCore, bool exists ) {
    id = _id;
    Contributor storage c = contributors[_id];
    account = c.account;
    ipfsHash = c.ipfsHash;
    hashFunction = c.hashFunction;
    hashSize = c.hashSize;
    isCore = c.isCore;
    exists = c.exists;
  }

  function canPerform(address _who, address _where, bytes32 _what, uint256[] memory _how) public returns (bool) {
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
