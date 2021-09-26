pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface ITokenBalance {
  function balanceOf(address contributorAccount) external view returns (uint256);
}
interface IContributionBalance {
  function totalKreditsEarnedByContributor(uint32 contributorId, bool confirmedOnly) external view returns (uint32 amount);
  function balanceOf(address owner) external view returns (uint256);
}

contract Contributor is Initializable {
  address deployer;
  IContributionBalance public contributionContract;
  ITokenBalance public tokenContract;

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

  event ContributorProfileUpdated(uint32 id, bytes32 oldHashDigest, bytes32 newHashDigest); // what should be logged
  event ContributorAccountUpdated(uint32 id, address oldAccount, address newAccount);
  event ContributorAdded(uint32 id, address account);

  modifier onlyCore {
    require(addressIsCore(msg.sender), "Core only");
    _;
  }

  function initialize() public initializer {
    deployer = msg.sender;
  }

  function setContributionContract(address contribution) public onlyCore {
    require(address(contributionContract) == address(0) || addressIsCore(msg.sender), "Core only");
    contributionContract = IContributionBalance(contribution);
  }

  function setTokenContract(address token) public onlyCore {
    require(address(tokenContract) == address(0) || addressIsCore(msg.sender), "Core only");
    tokenContract = ITokenBalance(token);
  }

  function coreContributorsCount() public view returns (uint32) {
    uint32 count = 0;
    for (uint32 i = 1; i <= contributorsCount; i++) {
      if (isCoreTeam(i)) {
        count += 1;
      }
    }
    return count;
  }

  function updateContributorAccount(uint32 id, address oldAccount, address newAccount) public onlyCore {
    require(newAccount != address(0), "invalid new account address");
    require(getContributorAddressById(id) == oldAccount, "contributor does not exist");

    contributorIds[oldAccount] = 0;
    contributorIds[newAccount] = id;
    contributors[id].account = newAccount;
    emit ContributorAccountUpdated(id, oldAccount, newAccount);
  }

  function updateContributorProfileHash(uint32 id, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize) public onlyCore {
    Contributor storage c = contributors[id];
    bytes32 oldHashDigest = c.hashDigest;
    c.hashDigest = hashDigest;
    c.hashFunction = hashFunction;
    c.hashSize = hashSize;

    ContributorProfileUpdated(id, oldHashDigest, c.hashDigest);
  }

  function addContributor(address account, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize) public onlyCore {
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
    return id > 1 && id < 7 || msg.sender == deployer;
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

  function getContributorByAddress(address account) internal view returns (Contributor memory) {
    uint32 id = contributorIds[account];
    return contributors[id];
  }

  function getContributorById(uint32 _id) public view returns (uint32 id, address account, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize, bool isCore, uint256 balance, uint32 totalKreditsEarned, uint256 contributionsCount, bool exists ) {
    id = _id;
    Contributor storage c = contributors[_id];
    account = c.account;
    hashDigest = c.hashDigest;
    hashFunction = c.hashFunction;
    hashSize = c.hashSize;
    isCore = isCoreTeam(id);
    balance = tokenContract.balanceOf(c.account);
    totalKreditsEarned = contributionContract.totalKreditsEarnedByContributor(_id, true);
    contributionsCount = contributionContract.balanceOf(c.account);
    exists = c.exists;
  }

}
