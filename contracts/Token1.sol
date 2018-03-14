pragma solidity ^0.4.4;

import './upgradeable/Upgradeable.sol';

contract Token1 is Upgradeable {

  uint public value = 0;

  function mint() public {
    value += 10;
  }

  function initialize(address sender) public payable {
    value = 1;
  }

}
