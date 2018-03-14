pragma solidity ^0.4.18;

import './Proxy.sol';
import './IRegistry.sol';
import './UpgradeabilityStorage.sol';

/**
 * @title UpgradeabilityProxy
 * @dev This contract represents a proxy where the implementation address to which it will delegate can be upgraded
 */
contract UpgradeabilityProxy is Proxy, UpgradeabilityStorage {

  function UpgradeabilityProxy(bytes32 _name, uint _version) public {
    _proxiedContractName = _name;
    registry = IRegistry(msg.sender);
    upgradeTo(_version);
  }

  /**
  * @dev Upgrades the implementation to the requested version
  * @param _version representing the version name of the new implementation to be set
  */
  function upgradeTo(uint _version) public {
    require(msg.sender == address(registry));
    _implementation = registry.getVersion(_proxiedContractName, _version);
  }

  /**
  * @dev Upgrades the implementation to the latest version
  */
  function upgradeToLatest() public {
    require(msg.sender == address(registry));
    _implementation = registry.getLatestVersion(_proxiedContractName);
  }

}
