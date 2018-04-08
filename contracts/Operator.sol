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
    uint256[] voterIds;
    mapping (uint256 => bool) votes;
    bool exists;
  }

  mapping(uint256 => Proposal) public proposals;
  uint256 public proposalsCount;

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

  function contributorsCount() view public returns (uint) {
    return contributorsContract().contributorsCount();
  }
  function coreContributorsCount() view public returns (uint) {
    return contributorsContract().coreContributorsCount();
  }

  function addContributor(address _address, bytes32 _ipfsHash, uint8 _hashFunction, uint8 _hashSize, bool _isCore) public coreOnly {
    contributorsContract().addContributor(_address, _ipfsHash, _hashFunction, _hashSize, _isCore);
  }

  function updateContributorIpfsHash(uint _id, bytes32 _ipfsHash, uint8 _hashFunction, uint8 _hashSize) public coreOnly {
    contributorsContract().updateContributorIpfsHash(_id, _ipfsHash, _hashFunction, _hashSize);
  }

  function getContributor(uint _id) view public returns (address account, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize, bool isCore) {
    bool exists;

    (account, ipfsHash, hashFunction, hashSize, isCore, exists) = contributorsContract().contributors(_id);

    require(exists);
  }

  function addProposal(uint _recipient, uint256 _amount, bytes32 _ipfsHash, uint8 _hashFunction, uint8 _hashSize) public returns (uint256 proposalId) {
    require(contributorsContract().exists(_recipient));

    proposalId = proposalsCount + 1;
    uint _votesNeeded = contributorsContract().coreContributorsCount() / 100 * 75;

    var p = proposals[proposalId];
    p.creator = msg.sender;
    p.recipientId = _recipient;
    p.amount = _amount;
    p.ipfsHash  = _ipfsHash;
    p.hashFunction = _hashFunction;
    p.hashSize =  _hashSize;
    p.votesCount =  0;
    p.votesNeeded = _votesNeeded;
    p.exists = true;
   
    proposalsCount++;
    ProposalCreated(proposalId, msg.sender, p.recipientId, p.amount);
  }

  function getProposal(uint _proposalId) public view returns (address creator, uint256 recipientId, uint256 votesCount, uint256 votesNeeded, uint256 amount, bool executed, bytes32 ipfsHash, uint8 hashFunction, uint8 hashSize, uint256[] voterIds, bool exists) {
    Proposal storage p = proposals[_proposalId];
    return (
      p.creator,
      p.recipientId, 
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

  function vote(uint256 _proposalId) public coreOnly returns (uint _pId, bool _executed) {
    var p = proposals[_proposalId];
    require(!p.executed);
    uint256 contributorId = contributorsContract().getContributorIdByAddress(msg.sender);
    require(p.votes[contributorId] != true);
    p.voterIds.push(contributorId);
    p.votes[contributorId] = true;

    p.votesCount++;
    _executed = false;
    _pId = _proposalId;
    if (p.votesCount >= p.votesNeeded) {
      executeProposal(_proposalId);
      _executed = true;
    }
    ProposalVoted(_pId, msg.sender, p.votesCount);
  }

  function executeProposal(uint proposalId) private returns (bool) {
    var p = proposals[proposalId];
    require(!p.executed);
    require(p.votesCount >= p.votesNeeded);
    address recipientAddress = contributorsContract().getContributorAddressById(p.recipientId);
    tokenContract().mintFor(recipientAddress, p.amount, proposalId);
    p.executed = true;
    ProposalExecuted(proposalId, p.recipientId, p.amount);
    return true;
  }

}
