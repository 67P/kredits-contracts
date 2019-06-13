const Kredits = require('../lib/kredits');
const IpfsPinner = require('../lib/utils/ipfs-pinner');

const network = process.env.ETH_NETWORK || 'rinkeby';
const rpcUrl = process.env.ETH_RPC_URL;
const apm = process.env.APM_DOMAIN || 'open.aragonpm.eth';

const ipfsConfig = {
  host: process.env.IPFS_HOST || 'localhost',
  port: process.env.IPFS_PORT || '5001',
  protocol: process.env.IPFS_PROTOCOL || 'http',
};
console.log(`Using IPFS:`, ipfsConfig);

(async () => {
  try {
    const kredits = await Kredits.for({ network, rpcUrl }, { apm, ipfsConfig }).init();
    const ipfsPinner = new IpfsPinner(kredits);

    ipfsPinner.pinAll().then(pins => {
      console.log('Pinned', JSON.stringify(pins, null, 2));
    });
    ipfsPinner.monitor((pin) => {
      console.log('Pinned', JSON.stringify(pin));
    });
    console.log(`Subscribed to DAO: ${kredits.Kernel.contract.address}`);
  } catch(e) {
    console.log(e);
    process.exit(1);
  }
})();
