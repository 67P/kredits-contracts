pragma solidity ^0.4.4;

import './Token1.sol';

contract Token2 is Token1 {

  function mint() public {
    value += 20;
  }

}
