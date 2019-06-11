//const Kredits = require('kredits-contracts');
const Kredits = require('../lib/kredits');
const multihashes = require('multihashes');

async function pinContributor (kredits, id) {
  const data = await kredits.Contributor.functions.getContributorById(id);
  const ipfsHash = multihashes.toB58String(kredits.ipfs.encodeHash(data));
  console.log(`Pinning Contributor ${id} ${ipfsHash}`);
  kredits.ipfs._ipfsAPI.pin.add(ipfsHash, (err) => {
    if (err) {
      console.log(`Failed to pin ${ipfsHash}`);
      console.log(err);
    }
  });
}

async function pinContribution (kredits, id) {
  const data = await kredits.Contribution.functions.getContribution(id);
  const ipfsHash = multihashes.toB58String(kredits.ipfs.encodeHash(data));
  console.log(`Pinning Contribution ${id} ${ipfsHash}`);
  kredits.ipfs._ipfsAPI.pin.add(ipfsHash, (err) => {
    if (err) {
      console.log(`Failed to pin ${ipfsHash}`);
      console.log(err);
    }
  });
}

async function all (kredits) {
  const contributionCount = await kredits.Contribution.count;
  for (let id=1; id<=contributionCount; id++) {
    pinContribution(kredits, id);
  }
  const contributorCount = await kredits.Contributor.count;
  for (let id=1; id<=contributorCount; id++) {
    pinContributor(kredits, id);
  }
}

function subscribe (kredits) {
  kredits.Contribution.on('ContributionAdded', async (id) => {
    pinContribution(kredits, id);
  });
  kredits.Contributor.on('ContributorAdded', async (id) => {
    pinContribution(kredits, id);
  });
  kredits.Contributor.on('ContributorProfileUpdated', async (id) => {
    pinContributor(kredits, id);
  });
}

const network = process.env.ETH_NETWORK || 'rinkeby';
const rpcUrl = process.env.ETH_RPC_URL;
const apm = process.env.APM_DOMAIN || 'open.aragonpm.eth';
const ipfsConfig = {
  host: process.env.IPFS_HOST || 'localhost',
  port: process.env.IPFS_PORT || '5001',
  protocol: process.env.IPFS_PROTOCOL || 'http'
};

console.log(`Using IPFS:`, ipfsConfig);

Kredits.for({ network, rpcUrl }, { apm, ipfsConfig }).init().then(async (kredits) => {
  all(kredits);
  subscribe (kredits);
  console.log(`Subscribed to new events for DAO: ${kredits.Kernel.contract.address}`);
});
