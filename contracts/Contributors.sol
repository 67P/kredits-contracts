pragma solidity ^0.4.18;

// import basic ERC20 details to be able to call balanceOf
import 'zeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol';
import './upgradeable/Upgradeable.sol';

contract Contributors is Upgradeable {

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

  event ContributorProfileUpdated(uint id, bytes32 oldIpfsHash, bytes32 newIpfsHash);
  event ContributorAccountUpdated(uint id, address oldAccount, address newAccount);
  event ContributorAdded(uint id, address account);

  modifier onlyCoreOrOperator() {
    require(msg.sender == registry.getProxyFor('Operator') || addressIsCore(msg.sender));
    _;
  }

  function initialize(address sender) public payable {
    require(msg.sender == address(registry));
    uint _id = 1;
    Contributor storage c = contributors[_id];
    c.exists = true;
    c.isCore = true;
    c.account = sender;
    contributorIds[sender] = _id;
    contributorsCount += 1;
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

  function updateContributorAccount(uint id, address oldAccount, address newAccount) public onlyCoreOrOperator {
    contributorIds[oldAccount] = 0;
    contributorIds[newAccount] = id;
    contributors[id].account = newAccount;
    ContributorAccountUpdated(id, oldAccount, newAccount);
  }

  function updateContributorIpfsHash(uint id, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize) public onlyCoreOrOperator {
    Contributor storage c = contributors[id];
    bytes32 oldIpfsHash = c.ipfsHash;
    c.ipfsHash = ipfsHash;
    c.hashFunction = hashFunction;
    c.hashSize = hashSize;

    ContributorProfileUpdated(id, oldIpfsHash, c.ipfsHash);
  }

  function addContributor(address account, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize, bool isCore) public onlyCoreOrOperator {
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
    ContributorAdded(_id, account);
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

  function getContributorById(uint _id) public view returns (uint id, address account, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize, bool isCore, uint balance, bool exists ) {
    id = _id;
    Contributor storage c = contributors[_id];
    account = c.account;
    ipfsHash = c.ipfsHash;
    hashFunction = c.hashFunction;
    hashSize = c.hashSize;
    isCore = c.isCore;
    exists = c.exists;
    
    ERC20Basic token = ERC20Basic(registry.getProxyFor('Token'));
    balance = token.balanceOf(account);
  }
}
