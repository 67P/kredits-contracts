pragma solidity ^0.4.18;

import './IRegistry.sol';
import './Upgradeable.sol';
import './UpgradeabilityProxy.sol';

/**
 * @title Registry
 * @dev This contract works as a registry of versions, it holds the implementations for the registered versions.
 */
contract Registry is IRegistry {
  // mapping of contract names to versions to implementation
  // "Token" => "1.0.0" => "0x123"
  mapping(bytes32 => mapping(uint => address)) public versions; 

  // current version for a certain contract
  mapping(bytes32 => uint) public currentVersions;

  // mapping of the contract names to the proxy addresses
  mapping(bytes32 => address) public proxies;

  /**
  * @dev Registers a new version with its implementation address
  * @param name of the contract
  * @param implementation representing the address of the new implementation to be registered
  */
  function addVersion(string name, address implementation) public {
    bytes32 key = keccak256(name);
    currentVersions[key] = currentVersions[key] + 1;
    uint version = currentVersions[key];
    require(versions[key][version] == 0x0);
    versions[key][version] = implementation;
    VersionAdded(name, version, implementation);
  }

  /**
  * @dev Tells the address of the implementation for a given version
  * @param name of the contract
  * @param version to query the implementation of
  * @return address of the implementation registered for the given version
  */
  function getVersion(string name, uint version) public view returns (address) {
    bytes32 key = keccak256(name);
    return versions[key][version];
  }

  function getLatestVersion(string name) public view returns (address) {
    bytes32 key = keccak256(name);
    uint current = currentVersions[key];
    return getVersion(name, current);
  }

  function getProxyFor(string name) public view returns (address) {
    bytes32 key = keccak256(name);
    return proxies[key];
  }

  function upgrade(string name, uint version) public {
    bytes32 key = keccak256(name);
    UpgradeabilityProxy(proxies[key]).upgradeTo(version);
    ProxyImplementationUpgraded(name, version);
  }

  function upgradeToLatest(string name) public {
    bytes32 key = keccak256(name);
    uint current = currentVersions[key];
    upgrade(name, current);
  }

  /**
  * @dev Creates an upgradeable proxy
  * @param name of the contract
  * @param version representing the first version to be set for the proxy
  * @return address of the new proxy created
  */
  function createProxy(string name, uint version) public payable returns (UpgradeabilityProxy) {
    bytes32 key = keccak256(name);
    require(proxies[key] == 0x0);
    UpgradeabilityProxy proxy = new UpgradeabilityProxy(name, version);
    proxies[key] = address(proxy);
    Upgradeable(proxy).initialize.value(msg.value)(msg.sender);
    ProxyCreated(name, proxy);
    return proxy;
  }

}
