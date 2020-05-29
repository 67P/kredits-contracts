pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "./ERC20Token.sol";

contract Token is ERC20Token, AragonApp {
  bytes32 public constant MINT_TOKEN_ROLE = keccak256("MINT_TOKEN_ROLE");

  // ensure alphabetic order
  enum Apps { Contribution, Contributor, Proposal, Reimbursement, Token }
  bytes32[5] public appIds;

  event LogMint(address indexed recipient, uint256 amount, uint32 contributionId);

  function initialize(bytes32[5] _appIds) public onlyInit {
    appIds = _appIds;
    name = 'Kredits';
    symbol = '₭S';
    decimals = 18;
    initialized();
  }

  function mintFor(address contributorAccount, uint256 amount, uint32 contributionId) public isInitialized auth(MINT_TOKEN_ROLE) {
    require(amount > 0, "INVALID_AMOUNT");

    uint256 amountInWei = amount.mul(1 ether);
    _mint(contributorAccount, amountInWei);
    emit LogMint(contributorAccount, amount, contributionId);
  }

}
