pragma solidity ^0.4.18;

// ToDo: only load interfaces
import './Token.sol';
import './Contributors.sol';

contract Operator is Upgradeable {

  struct Proposal {
    address creatorAccount;
    uint contributorId;
    uint votesCount;
    uint votesNeeded;
    uint256 amount;
    bool executed;
    bytes32 ipfsHash;
    uint8 hashFunction;
    uint8 hashSize;
    uint256[] voterIds;
    mapping (uint256 => bool) votes;
    bool exists;
  }

  mapping(uint256 => Proposal) public proposals;
  uint256 public proposalsCount;

  event ProposalCreated(uint256 id, address creatorAccount, uint256 contributorId, uint256 amount);
  event ProposalVoted(uint256 id, uint256 voterId, uint256 totalVotes);
  event ProposalExecuted(uint256 id, uint256 contributorId, uint256 amount);

  modifier coreOnly() { 
    require(contributorsContract().addressIsCore(msg.sender));
    _;
  }
  modifier contributorOnly() { 
    require(contributorsContract().addressExists(msg.sender));
    _;
  }
  modifier noEther() { 
    require(msg.value == 0);
    _;
  }

  function contributorsContract() view public returns (Contributors) {
    return Contributors(registry.getProxyFor('Contributors'));
  }
  function tokenContract() view public returns (Token) {
    return Token(registry.getProxyFor('Token'));
  }

  function contributorsCount() view public returns (uint) {
    return contributorsContract().contributorsCount();
  }
  function coreContributorsCount() view public returns (uint) {
    return contributorsContract().coreContributorsCount();
  }

  function addProposal(uint contributorId, uint256 amount, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize) public {
    require(contributorsContract().exists(contributorId));

    uint256 proposalId = proposalsCount + 1;
    uint256 _votesNeeded = contributorsContract().coreContributorsCount() / 100 * 75;

    var p = proposals[proposalId];
    p.creatorAccount = msg.sender;
    p.contributorId = contributorId;
    p.amount = amount;
    p.ipfsHash  = ipfsHash;
    p.hashFunction = hashFunction;
    p.hashSize =  hashSize;
    p.votesCount =  0;
    p.votesNeeded = _votesNeeded;
    p.exists = true;
   
    proposalsCount++;
    ProposalCreated(proposalId, msg.sender, p.contributorId, p.amount);
  }

  function getProposal(uint proposalId) public view returns (uint256 id, address creatorAccount, uint256 contributorId, uint256 votesCount, uint256 votesNeeded, uint256 amount, bool executed, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize, uint256[] voterIds, bool exists) {
    id = proposalId;
    Proposal storage p = proposals[id];
    return (
      id,
      p.creatorAccount,
      p.contributorId, 
      p.votesCount, 
      p.votesNeeded,
      p.amount,
      p.executed, 
      p.ipfsHash, 
      p.hashFunction,
      p.hashSize,
      p.voterIds,
      p.exists
    );
  }

  function vote(uint256 proposalId) public coreOnly {
    var p = proposals[proposalId];
    require(!p.executed);
    uint256 voterId = contributorsContract().getContributorIdByAddress(msg.sender);
    require(p.votes[voterId] != true);
    p.voterIds.push(voterId);
    p.votes[voterId] = true;

    p.votesCount++;
    if (p.votesCount >= p.votesNeeded) {
      executeProposal(proposalId);
    }
    ProposalVoted(proposalId, voterId, p.votesCount);
  }

  function executeProposal(uint proposalId) private {
    var p = proposals[proposalId];
    require(!p.executed);
    require(p.votesCount >= p.votesNeeded);
    address recipientAddress = contributorsContract().getContributorAddressById(p.contributorId);
    tokenContract().mintFor(recipientAddress, p.amount, proposalId);
    p.executed = true;
    ProposalExecuted(proposalId, p.contributorId, p.amount);
  }

}
