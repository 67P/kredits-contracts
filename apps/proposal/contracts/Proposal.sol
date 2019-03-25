pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/kernel/IKernel.sol";

interface IContributor {
  function getContributorAddressById(uint256 contributorId) public view returns (address);
  function getContributorIdByAddress(address contributorAccount) public view returns (uint256);
  function exists(uint256 contributorId) public view returns (bool);
}

interface IContribution {
  function add(uint256 amount, address contributor, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize) public;
}

contract Proposal is AragonApp {

  bytes32 public constant ADD_PROPOSAL_ROLE = keccak256("ADD_PROPOSAL_ROLE");
  bytes32 public constant VOTE_PROPOSAL_ROLE = keccak256("VOTE_PROPOSAL_ROLE");

  bytes32 public constant KERNEL_APP_ADDR_NAMESPACE = 0xd6f028ca0e8edb4a8c9757ca4fdccab25fa1e0317da1188108f7d2dee14902fb;
  bytes32 public constant CONTRIBUTOR_APP_ID = 0x8e50972b062e83b48dbb2a68d8a058f2a07227ca183c144dc974e6da3186d7e9;
  bytes32 public constant CONTRIBUTION_APP_ID = 0x09f5274cba299b46c5be722ef672d10eef7a2ef980b612aef529d74fb9da7643;

  struct Proposal {
    address creatorAccount;
    uint contributorId;
    uint votesCount;
    uint votesNeeded;
    uint256 amount;
    bool executed;
    bytes32 hashDigest;
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

  function initialize() public onlyInit {
    initialized();
  }

  function getContributorContract() public view returns (address) {
    return IKernel(kernel()).getApp(KERNEL_APP_ADDR_NAMESPACE, CONTRIBUTOR_APP_ID);
  }

  function getContributionContract() public view returns (address) {
    return IKernel(kernel()).getApp(KERNEL_APP_ADDR_NAMESPACE, CONTRIBUTION_APP_ID);
  }

  function addProposal(uint contributorId, uint256 amount, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize) public isInitialized auth(ADD_PROPOSAL_ROLE) {
    require(IContributor(getContributorContract()).exists(contributorId), 'CONTRIBUTOR_NOT_FOUND');

    uint256 proposalId = proposalsCount + 1;
    uint256 _votesNeeded = 1; //contributorsContract().coreContributorsCount() / 100 * 75;

    Proposal storage p = proposals[proposalId];
    p.creatorAccount = msg.sender;
    p.contributorId = contributorId;
    p.amount = amount;
    p.hashDigest  = hashDigest;
    p.hashFunction = hashFunction;
    p.hashSize =  hashSize;
    p.votesCount =  0;
    p.votesNeeded = _votesNeeded;
    p.exists = true;
   
    proposalsCount++;
    emit ProposalCreated(proposalId, msg.sender, p.contributorId, p.amount);
  }

  function getProposal(uint proposalId) public view returns (uint256 id, address creatorAccount, uint256 contributorId, uint256 votesCount, uint256 votesNeeded, uint256 amount, bool executed, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize, uint256[] voterIds, bool exists) {
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
      p.hashDigest, 
      p.hashFunction,
      p.hashSize,
      p.voterIds,
      p.exists
    );
  }

  function vote(uint256 proposalId) public isInitialized auth(VOTE_PROPOSAL_ROLE) {
    Proposal storage p = proposals[proposalId];
    require(!p.executed, 'ALREADY_EXECUTED');
    uint256 voterId = IContributor(getContributorContract()).getContributorIdByAddress(msg.sender);
    require(p.votes[voterId] != true, 'ALREADY_VOTED');
    p.voterIds.push(voterId);
    p.votes[voterId] = true;

    p.votesCount++;
    if (p.votesCount >= p.votesNeeded) {
      executeProposal(proposalId);
    }
    emit ProposalVoted(proposalId, voterId, p.votesCount);
  }

  function batchVote(uint256[] _proposalIds) public isInitialized auth(VOTE_PROPOSAL_ROLE) {
    for (uint256 i = 0; i < _proposalIds.length; i++) {
      vote(_proposalIds[i]);
    }
  }

  function executeProposal(uint proposalId) private {
    Proposal storage p = proposals[proposalId];
    require(!p.executed, 'ALREADY_EXECUTED');
    require(p.votesCount >= p.votesNeeded, 'MISSING_VOTES');
    
    p.executed = true;
    address contributorAccount = IContributor(getContributorContract()).getContributorAddressById(p.contributorId);
    IContribution(getContributionContract()).add(p.amount, contributorAccount, p.hashDigest, p.hashFunction, p.hashSize);
    emit ProposalExecuted(proposalId, p.contributorId, p.amount);
  }

}
