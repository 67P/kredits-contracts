pragma solidity ^0.4.18;

import './IRegistry.sol';

/**
 * @title UpgradeabilityStorage
 * @dev This contract holds all the necessary state variables to support the upgrade functionality
 */
contract UpgradeabilityStorage {
  // Versions registry
  IRegistry internal registry;

  // Address of the current implementation
  address internal _implementation;

  // contract name
  bytes32 public _proxiedContractName;


  modifier requireRegistry() {
    require(address(registry) != 0x0);
    _;
  }
  modifier onlyRegistryContractFor(bytes32 name) {
    require(address(registry) != 0x0);
    require(msg.sender == registry.getProxyFor(name));
    _;
  }

  /**
  * @dev Tells the address of the current implementation
  * @return address of the current implementation
  */
  function implementation() public view returns (address) {
    return _implementation;
  }
}
