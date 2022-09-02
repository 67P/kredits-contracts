pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

interface ContributorInterface {
  function getContributorAddressById(uint32 contributorId) external view returns (address);
  function getContributorIdByAddress(address contributorAccount) external view returns (uint32);
  function addressIsCore(address sender) external view returns (bool);
}

contract Token is Initializable, ERC20Upgradeable {
  ContributorInterface public contributorContract;
  using SafeMathUpgradeable for uint256;

  address public contributorContractAddress;

  event KreditsMinted(address indexed recipient, uint256 amount);

  function initialize() public virtual initializer {
    __ERC20_init("Kredits", "KS");
  }

  function decimals() public view virtual override returns (uint8) {
    return 0;
  }

  function setContributorContract(address contributor) public {
    require(address(contributorContract) == address(0) || contributorContract.addressIsCore(msg.sender), "Core only");
    contributorContract = ContributorInterface(contributor);
    contributorContractAddress = contributor;
  }

  function mintFor(address contributorAccount, uint256 amount) public {
    require(contributorContractAddress == msg.sender, "Only Contributor");
    require(amount > 0, "INVALID_AMOUNT");

    _mint(contributorAccount, amount);
    emit KreditsMinted(contributorAccount, amount);
  }
}
