pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

contract Token is Initializable, ERC20Upgradeable {
  using SafeMathUpgradeable for uint256;

  bytes32 public constant MINT_TOKEN_ROLE = keccak256("MINT_TOKEN_ROLE");

  event LogMint(address indexed recipient, uint256 amount, uint32 contributionId);

  function initialize() public virtual initializer {
    __ERC20_init('Kredits', 'KS');
  }

  function mintFor(address contributorAccount, uint256 amount, uint32 contributionId) public {
    require(amount > 0, "INVALID_AMOUNT");

    uint256 amountInWei = amount.mul(1 ether);
    _mint(contributorAccount, amountInWei);
    emit LogMint(contributorAccount, amount, contributionId);
  }

}
