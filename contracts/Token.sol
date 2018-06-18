pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';
import './upgradeable/Upgradeable.sol';

contract Token is Upgradeable, BasicToken {
  string public name;
  string public symbol;
  uint8 public decimals;

  event LogMint(address indexed recipient, uint256 amount, uint256 proposalId);
 
  function initialize(address sender) public payable {
    require(msg.sender == address(registry));
    name = 'Kredits';
    symbol = 'K';
    decimals = 18;
  }

  function mintFor(address contributorAccount, uint256 amount, uint proposalId) onlyRegistryContractFor('Contribution') public {
    totalSupply_ = totalSupply_.add(amount);
    balances[contributorAccount] = balances[contributorAccount].add(amount); 

    LogMint(contributorAccount, amount, proposalId);
  }

}
