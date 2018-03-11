pragma solidity ^0.4.4;

import './upgradeable/Upgradeable.sol';

contract Token1 is Upgradeable {

  uint public value;
  function Token() public {
    value = 1;
  }

  function mint() public {
    value += 10;
  }

}
