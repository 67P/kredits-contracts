pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/kernel/IKernel.sol";
import "@aragon/os/contracts/common/DepositableStorage.sol";
import "@aragon/os/contracts/common/EtherTokenConstant.sol";
import "@aragon/os/contracts/common/SafeERC20.sol";
import "@aragon/os/contracts/lib/token/ERC20.sol";

interface IContributor {
  function getContributorAddressById(uint32 id) view public returns (address);
  function contributorsCount() view public returns (uint32);
}

interface IToken {
  function balanceOf(address owner) public view returns (uint256);
  function totalSupply() public view returns (uint256);
}

contract Vault is EtherTokenConstant, AragonApp, DepositableStorage {
  using SafeERC20 for ERC20;

  string private constant ERROR_NOT_DEPOSITABLE = "VAULT_NOT_DEPOSITABLE";
  string private constant ERROR_DEPOSIT_VALUE_ZERO = "VAULT_DEPOSIT_VALUE_ZERO";
  string private constant ERROR_VALUE_MISMATCH = "VAULT_VALUE_MISMATCH";
  string private constant ERROR_TOKEN_TRANSFER_FROM_REVERTED = "VAULT_TOKEN_TRANSFER_FROM_REVERT";

  uint256 private _snapshotTotalSupply;

  mapping (address => uint256) private _snapshotBalances;

  // ensure alphabetic order
  enum Apps { Contribution, Contributor, Proposal, Token }
  bytes32[4] public appIds;

  event VaultDeposit(address indexed token, address indexed sender, uint256 amount);
  event VaultWithdraw(address indexed token, address indexed receiver, uint256 amount);

  function () external payable isInitialized {
    _deposit(ETH, msg.value);
  }

  /**
  * @notice Initialize Vault app
  * @dev As an AragonApp it needs to be initialized in order for roles (`auth` and `authP`) to work
  */
  function initialize(bytes32[4] _appIds) external onlyInit {
    initialized();

    appIds = _appIds;
    setDepositable(true);
  }

  function getTokenContract() public view returns (address) {
    IKernel k = IKernel(kernel());

    return k.getApp(KERNEL_APP_ADDR_NAMESPACE, appIds[uint8(Apps.Token)]);
  }

  function getContributorContract() public view returns (address) {
    IKernel k = IKernel(kernel());

    return k.getApp(KERNEL_APP_ADDR_NAMESPACE, appIds[uint8(Apps.Contributor)]);
  }

  function getContributorAddressById(uint32 contributorId) public view returns (address) {
    address contributor = getContributorContract();
    return IContributor(contributor).getContributorAddressById(contributorId);
  }

  function getContributorsAddresses() internal view returns (address[]) {
    address contributor = getContributorContract();
    uint32 contributorsCount = IContributor(contributor).contributorsCount();

    address[] memory contributorsAddresses = new address[](contributorsCount);

    for(uint32 i = 1; i <= contributorsCount; i++) {
      address contributorAddress = IContributor(contributor).getContributorAddressById(i);
      contributorsAddresses[i-1] = contributorAddress;
    }

    return contributorsAddresses;
  }

  function balanceOf(address owner) public view returns (uint256) {
    address token = getTokenContract();
    return IToken(token).balanceOf(owner);
  }

  function totalSupply() public view returns (uint256) {
    address token = getTokenContract();
    return IToken(token).totalSupply();
  }

  /**
  * @notice Deposit `_value` `_token` to the vault
  * @param _token Address of the token being transferred
  * @param _value Amount of tokens being transferred
  */
  function deposit(address _token, uint256 _value) external payable isInitialized {
    _deposit(_token, _value);
  }

  function withdraw(address _token) external payable isInitialized {
    uint256 contributorFundPercentage = (balanceOf(msg.sender) * 100) / totalSupply();
    //to check if sender is a contributor
    require(contributorFundPercentage > 0, "Contributor have no fund");

    uint256 contributorFund = (address(this).balance * contributorFundPercentage) / 100;
    msg.sender.transfer(contributorFund);

    emit VaultWithdraw(_token, msg.sender, contributorFund);
  }

  function balance(address _token) public view returns (uint256) {
    if (_token == ETH) {
        return address(this).balance;
    } else {
        return ERC20(_token).staticBalanceOf(address(this));
    }
  }

  /**
  * @dev Disable recovery escape hatch, as it could be used
  *      maliciously to transfer funds away from the vault
  */
  function allowRecoverability(address) public view returns (bool) {
    return false;
  }

  function _deposit(address _token, uint256 _value) internal {
    require(isDepositable(), ERROR_NOT_DEPOSITABLE);
    require(_value > 0, ERROR_DEPOSIT_VALUE_ZERO);

    /*
    if (_token == ETH) {
        // Deposit is implicit in this case
        require(msg.value == _value, ERROR_VALUE_MISMATCH);
    } else {
        require(
            ERC20(_token).safeTransferFrom(msg.sender, address(this), _value),
            ERROR_TOKEN_TRANSFER_FROM_REVERTED
        );
    }
    */

    if (_token == ETH) {
        // Deposit is implicit in this case
        require(msg.value == _value, ERROR_VALUE_MISMATCH);

        createSnapshot();

        emit VaultDeposit(_token, msg.sender, _value);
    }
  }

  function createSnapshot() internal {
    updateSnapshotTotalSupply();
    updateSnapshotBalances();
  }

  function updateSnapshotTotalSupply() internal {
    _snapshotTotalSupply = totalSupply();
  }

  function updateSnapshotBalances() internal {
    address[] memory contributorsAddresses = getContributorsAddresses();

    for(uint32 i = 0; i < contributorsAddresses.length; i++) {
      _snapshotBalances[contributorsAddresses[i]] = balanceOf(contributorsAddresses[i]);
    }
  }

}