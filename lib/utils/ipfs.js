const ipfsClient = require('ipfs-http-client');
const multihashes = require('multihashes');
const fetch = require('node-fetch');

class IPFS {
  constructor (config) {
    if (!config) {
      config = { host: 'localhost', port: '5001', protocol: 'http' };
    }
    this._config = config;
    this._ipfsAPI = ipfsClient.create(config);

    this._ipfsAPI.id().then(res => {
      console.debug('IPFS ID:', res.id);
    }).catch(e => {
      console.debug('IPFS config:', config);
      console.warn('Failed to initialize IPFS:', e.message);
    });
  }

  async catAndMerge (contractData, deserialize) {
    let data = {...contractData}; // data from ethers.js is not extensible. this copy the attributes in a new object
    // if no hash details are found simply return the data; nothing to merge
    if (!data.hashSize || data.hashSize === 0) {
      return data;
    }
    // merge ipfsHash (encoded from hashDigest, hashSize, hashFunction)
    data.ipfsHash = multihashes.toB58String(this.encodeHash(data));

    return this.cat(data.ipfsHash)
      .then(deserialize)
      .then(attributes => {
        return Object.assign({}, data, attributes);
      });
  }

  async add (data) {
    return this._ipfsAPI.add(data)
      .then(res => {
        return this.decodeHash(res.path);
      });
  }

  async cat (hashData) {
    let ipfsHash = hashData; // default - if it is a string
    if (Object.prototype.hasOwnProperty.call(hashData, 'hashSize')) {
      ipfsHash = this.encodeHash(hashData);
    }
    if (this._config['gatewayUrl']) {
      return fetch(`${this._config['gatewayUrl']}/${ipfsHash}`).then(r => r.text());
    } else {
      const res = this._ipfsAPI.cat(ipfsHash);
      let str = '';
      for await (const buffer of res) {
        str += buffer.toString();
      }
      return Promise.resolve(str);
    }
  }

  pin (hashData) {
    let ipfsHash = hashData; // default - if it is a string
    if (Object.prototype.hasOwnProperty.call(hashData, 'hashSize')) {
      ipfsHash = this.encodeHash(hashData);
    }
    return this._ipfsAPI.pin.add(multihashes.toB58String(ipfsHash));
  }

  decodeHash (ipfsHash) {
    let multihash = multihashes.decode(multihashes.fromB58String(ipfsHash));
    return {
      hashDigest: '0x' + multihashes.toHexString(multihash.digest),
      hashSize: multihash.length,
      hashFunction: multihash.code,
      ipfsHash: ipfsHash,
    };
  }

  encodeHash (hashData) {
    const digest = Buffer.from(hashData.hashDigest.slice(2), 'hex');
    return multihashes.encode(digest, hashData.hashFunction, hashData.hashSize);
  }
}

module.exports = IPFS;
