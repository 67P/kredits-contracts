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
  event ContributorAddressUpdated(uint id, address oldAddress, address newAddress);
  event ContributorAdded(uint id, address _address);

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

  function updateContributorAddress(uint _id, address _oldAddress, address _newAddress) public onlyCoreOrOperator {
    contributorIds[_oldAddress] = 0;
    contributorIds[_newAddress] = _id;
    contributors[_id].account = _newAddress;
    ContributorAddressUpdated(_id, _oldAddress, _newAddress);
  }

  function updateContributorIpfsHash(uint _id, bytes32 _ipfsHash, uint8 _hashFunction, uint8 _hashSize) public onlyCoreOrOperator {
    Contributor storage c = contributors[_id];
    bytes32 _oldIpfsHash = c.ipfsHash;
    c.ipfsHash = _ipfsHash;
    c.hashFunction = _hashFunction;
    c.hashSize = _hashSize;

    ContributorProfileUpdated(_id, _oldIpfsHash, c.ipfsHash);
  }

  function addContributor(address _address, bytes32 _ipfsHash, uint8 _hashFunction, uint8 _hashSize, bool _isCore) public onlyCoreOrOperator {
    require(!addressExists(_address));
    uint _id = contributorsCount + 1;
    assert(!contributors[_id].exists); // this can not be acually
    Contributor storage c = contributors[_id];
    c.exists = true;
    c.isCore = _isCore;
    c.hashFunction = _hashFunction;
    c.hashSize = _hashSize;
    c.ipfsHash = _ipfsHash;
    c.account = _address;
    contributorIds[_address] = _id;

    contributorsCount += 1;
    ContributorAdded(_id, _address);
  }

  function isCore(uint _id) view public returns (bool) {
    return contributors[_id].isCore;
  }

  function exists(uint _id) view public returns (bool) {
    return contributors[_id].exists;
  }

  function addressIsCore(address _address) view public returns (bool) {
    return getContributorByAddress(_address).isCore;
  }

  function addressExists(address _address) view public returns (bool) {
    return getContributorByAddress(_address).exists;
  }

  function getContributorIdByAddress(address _address) view public returns (uint) {
    return contributorIds[_address];
  }

  function getContributorAddressById(uint _id) view public returns (address) {
    return contributors[_id].account;
  }

  function getContributorByAddress(address _address) internal view returns (Contributor) {
    uint id = contributorIds[_address];
    return contributors[id];
  }

  function getContributorById(uint _id) view returns (address account, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize, bool isCore, uint balance, bool exists ) {
    Contributor c = contributors[_id];
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
