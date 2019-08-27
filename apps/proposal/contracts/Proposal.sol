pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/kernel/IKernel.sol";

interface IContributor {
  function getContributorAddressById(uint32 contributorId) public view returns (address);
  function getContributorIdByAddress(address contributorAccount) public view returns (uint32);
  function exists(uint32 contributorId) public view returns (bool);
}

interface IContribution {
  function add(uint32 amount, uint32 contributorId, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize) public;
}

contract Proposal is AragonApp {

  bytes32 public constant ADD_PROPOSAL_ROLE = keccak256("ADD_PROPOSAL_ROLE");
  bytes32 public constant VOTE_PROPOSAL_ROLE = keccak256("VOTE_PROPOSAL_ROLE");

  bytes32 public constant KERNEL_APP_ADDR_NAMESPACE = 0xd6f028ca0e8edb4a8c9757ca4fdccab25fa1e0317da1188108f7d2dee14902fb;
  // ensure alphabetic order
  enum Apps { Contribution, Contributor, Proposal, Token, Vault }
  bytes32[5] public appIds;

  struct Proposal {
    address creatorAccount;
    uint32 contributorId;
    uint16 votesCount;
    uint16 votesNeeded;
    uint32 amount;
    bool executed;
    bytes32 hashDigest;
    uint8 hashFunction;
    uint8 hashSize;
    uint32[] voterIds;
    mapping (uint32 => bool) votes;
    bool exists;
  }

  mapping(uint32 => Proposal) public proposals;
  uint32 public proposalsCount;

  event ProposalCreated(uint32 id, address creatorAccount, uint32 contributorId, uint32 amount);

  event ProposalVoted(uint32 id, uint32 voterId, uint16 totalVotes);
  event ProposalExecuted(uint32 id, uint32 contributorId, uint32 amount);

  function initialize(bytes32[5] _appIds) public onlyInit {
    appIds = _appIds;
    initialized();
  }

  function getContract(uint8 appId) public view returns (address) {
    IKernel k = IKernel(kernel());
    return k.getApp(KERNEL_APP_ADDR_NAMESPACE, appIds[appId]);
  }

  function addProposal(uint32 contributorId, uint32 amount, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize) public isInitialized auth(ADD_PROPOSAL_ROLE) {
    require(IContributor(getContract(uint8(Apps.Contributor))).exists(contributorId), 'CONTRIBUTOR_NOT_FOUND');

    uint32 proposalId = proposalsCount + 1;
    uint16 _votesNeeded = 1; //contributorsContract().coreContributorsCount() / 100 * 75;

    Proposal storage p = proposals[proposalId];
    p.creatorAccount = msg.sender;
    p.contributorId = contributorId;
    p.amount = amount;
    p.hashDigest = hashDigest;
    p.hashFunction = hashFunction;
    p.hashSize = hashSize;
    p.votesCount = 0;
    p.votesNeeded = _votesNeeded;
    p.exists = true;

    proposalsCount++;
    emit ProposalCreated(proposalId, msg.sender, p.contributorId, p.amount);
  }

  function getProposal(uint32 proposalId) public view returns (uint32 id, address creatorAccount, uint32 contributorId, uint16 votesCount, uint16 votesNeeded, uint32 amount, bool executed, bytes32 hashDigest, uint8 hashFunction, uint8 hashSize, uint32[] voterIds, bool exists) {
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

  function vote(uint32 proposalId) public isInitialized auth(VOTE_PROPOSAL_ROLE) {
    Proposal storage p = proposals[proposalId];
    require(!p.executed, 'ALREADY_EXECUTED');
    uint32 voterId = IContributor(getContract(uint8(Apps.Contributor))).getContributorIdByAddress(msg.sender);
    require(p.votes[voterId] != true, 'ALREADY_VOTED');
    p.voterIds.push(voterId);
    p.votes[voterId] = true;

    p.votesCount++;
    if (p.votesCount >= p.votesNeeded) {
      executeProposal(proposalId);
    }
    emit ProposalVoted(proposalId, voterId, p.votesCount);
  }

  function batchVote(uint32[] _proposalIds) public isInitialized auth(VOTE_PROPOSAL_ROLE) {
    for (uint32 i = 0; i < _proposalIds.length; i++) {
      vote(_proposalIds[i]);
    }
  }

  function executeProposal(uint32 proposalId) private {
    Proposal storage p = proposals[proposalId];
    require(!p.executed, 'ALREADY_EXECUTED');
    require(p.votesCount >= p.votesNeeded, 'MISSING_VOTES');

    p.executed = true;
    IContribution(getContract(uint8(Apps.Contribution))).add(p.amount, p.contributorId, p.hashDigest, p.hashFunction, p.hashSize);
    emit ProposalExecuted(proposalId, p.contributorId, p.amount);
  }

}
