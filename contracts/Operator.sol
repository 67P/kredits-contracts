pragma solidity ^0.4.18;

// ToDo: only load interfaces
import './Token.sol';
import './Contributors.sol';

contract Operator is Upgradeable {

  struct Proposal {
    address creator;
    uint recipientId;
    uint votesCount;
    uint votesNeeded;
    uint256 amount;
    bool executed;
    bytes32 ipfsHash;
    uint8 hashFunction;
    uint8 hashSize;
    mapping (address => bool) votes;
    bool exists;
  }

  Proposal[] public proposals;

  event ProposalCreated(uint256 id, address creator, uint recipient, uint256 amount);
  event ProposalVoted(uint256 id, address voter, uint256 totalVotes);
  event ProposalExecuted(uint256 id, uint recipient, uint256 amount);

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

  function contributorsCount() constant public returns (uint) {
    return contributorsContract().contributorsCount();
  }
  function coreContributorsCount() constant public returns (uint) {
    return contributorsContract().coreContributorsCount();
  }

  function addContributor(address _address, bytes32 _profileHash, uint8 _hashFunction, uint8 _hashSize, bool _isCore) public coreOnly {
    contributorsContract().addContributor(_address, _hashFunction, _hashSize, _profileHash, _isCore);
  }

  function updateContributorProfileHash(uint _id, bytes32 _profileHash, uint8 _hashFunction, uint8 _hashSize) public coreOnly {
    contributorsContract().updateContributorProfileHash(_id, _hashFunction, _hashSize, _profileHash);
  }

  function getContributor(uint _id) constant public returns (address account, uint8 hashFunction, uint8 hashSize, bytes32 profileHash, bool isCore) {
    bool exists;

    (account, profileHash, hashFunction, hashSize, isCore, exists) = contributorsContract().contributors(_id);

    if (!exists) { throw; }
  }

  function proposalsCount() constant public returns (uint) {
    return proposals.length;
  }

  function addProposal(uint _recipient, uint256 _amount, bytes32 _ipfsHash, uint8 _hashFunction, uint8 _hashSize) public returns (uint256 proposalId) {
    require(contributorsContract().exists(_recipient));

    proposalId = proposals.length;
    uint _votesNeeded = contributorsContract().coreContributorsCount() / 100 * 75;

    var p = Proposal({
      creator: msg.sender,
      recipientId: _recipient,
      amount: _amount,
      ipfsHash: _ipfsHash,
      hashFunction: _hashFunction,
      hashSize: _hashSize,
      votesCount: 0,
      votesNeeded: _votesNeeded,
      executed: false,
      exists: true
    });
    proposals.push(p);
    ProposalCreated(proposalId, msg.sender, p.recipientId, p.amount);
  }

  function vote(uint256 _proposalId) public coreOnly returns (uint _pId) {
    var p = proposals[_proposalId];
    require(!p.executed);
    require(!p.votes[msg.sender]);
    p.votes[msg.sender] = true;
    p.votesCount++;
    ProposalVoted(_pId, msg.sender, p.votesCount);
  }

  function hasVotedFor(address _sender, uint256 _proposalId) public constant returns (bool) {
    Proposal p = proposals[_proposalId];
    return p.exists && p.votes[_sender];
  }

  function executeProposal(uint proposalId) private returns (bool) {
    var p = proposals[proposalId];
    require(!p.executed);
    require(p.votesCount >= p.votesNeeded);
    p.executed = true;
    address recipientAddress = contributorsContract().getContributorAddressById(p.recipientId);
    tokenContract().mintFor(recipientAddress, p.amount, proposalId);
    ProposalExecuted(proposalId, p.recipientId, p.amount);
    return true;
  }

}
