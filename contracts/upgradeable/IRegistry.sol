pragma solidity ^0.4.18;

/**
 * @title IRegistry
 * @dev This contract represents the interface of a registry contract
 */
interface IRegistry {
  /**
  * @dev This event will be emitted every time a new proxy is created
  * @param name of the contract, as specified in the registry
  * @param proxy representing the address of the proxy created
  */
  event ProxyCreated(bytes32 name, address proxy);

  /**
  * @dev This event will be emitted every time a new implementation is registered
  * @param name of the contract, as specified in the registry
  * @param version representing the version name of the registered implementation
  * @param implementation representing the address of the registered implementation
  */
  event VersionAdded(bytes32 name, uint version, address implementation);

  /**
  * @dev This event will be emitted every time a proxy is upgraded to a new version
  * @param name of the contract, as specified in the registry
  * @param version representing the version name of the registered implementation
  */
  event ProxyImplementationUpgraded(bytes32 name, uint version);

  /**
  * @dev Registers a new version with its implementation address
  * @param name of the contract, as specified in the registry
  * @param implementation representing the address of the new implementation to be registered
  */
  function addVersion(bytes32 name, address implementation) public;

  /**
  * @dev Tells the address of the implementation for a given version
  * @param name of the contract, as specified in the registry
  * @param version to query the implementation of
  * @return address of the implementation registered for the given version
  */
  function getVersion(bytes32 name, uint version) public view returns (address);

  /**
  * @dev Tells the latest address of the implementation
  * @param name of the contract, as specified in the registry
  * @return address of the implementation registered for the latest version
  */
  function getLatestVersion(bytes32 name) public view returns (address);

  function getProxyFor(bytes32 name) public view returns (address);
}
