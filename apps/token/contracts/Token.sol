pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "./ERC20Token.sol";

contract Token is ERC20Token, AragonApp {
  bytes32 public constant MINT_TOKEN_ROLE = keccak256("MINT_TOKEN_ROLE");

  event LogMint(address indexed recipient, uint256 amount, uint256 contributionId);
  
  function initialize() public onlyInit {
    initialized();
  }

  function mintFor(address contributorAccount, uint256 amount, uint256 contributionId) public isInitialized auth(MINT_TOKEN_ROLE) {
    _mint(contributorAccount, amount);
    emit LogMint(contributorAccount, amount, contributionId);
  }

}
