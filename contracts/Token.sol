pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';
import './upgradeable/Upgradeable.sol';

contract Token is Upgradeable, BasicToken {
  string public name;
  string public symbol;
  uint8 public decimals;

  event LogMint(address indexed recipient, uint256 amount, string reference);
 
  function initialize(address sender) public payable {
    require(msg.sender == address(registry));
    name = 'Kredits';
    symbol = 'K';
    decimals = 18;
  }

  function mintFor(address _recipient, uint256 _amount, string _reference) onlyRegistryContractFor('Operator') public returns (bool success) {
    totalSupply_ = totalSupply_.add(_amount);
    balances[_recipient] = balances[_recipient].add(_amount); 

    LogMint(_recipient, _amount, _reference);
    return true;
  }

}
