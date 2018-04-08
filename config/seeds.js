let contractCalls = {
  Contributors: {
    addContributor: [
      // make sure to use an IPFS hash of one of the objects in ipfsContent
      ['0x24dd2aedd8a9fe52ac071b3a23b2fc8f225c185e', '0x272bbfc66166f26cae9c9b96b7f9590e095f02edf342ac2dd71e1667a12116ca', 18, 32, true], // QmQyZJT9uikzDYTZLhhyVZ5ReZVCoMucYzyvDokDJsijhj
      ['0xa502eb4021f3b9ab62f75b57a94e1cfbf81fd827', '0x9569ed44826286597982e40bbdff919c6b7752e29d13250efca452644e6b4b25', 18, 32, true] // QmYPu8zvtfDy18ZqHCviVxnKtxycw5UTJLJyk9oAEjWfnL
    ]
  },
  Operator: {
    addProposal: [
      [1, 23, '0x1e1a168d736fc825213144973a8fd5b3cc9f37ad821a8b3d9c3488034bbf69d8', 18, 32], // QmQNA1hhVyL1Vm6HiRxXe9xmc6LUMBDyiNMVgsjThtyevs"
      [2, 42, '0x1e1a168d736fc825213144973a8fd5b3cc9f37ad821a8b3d9c3488034bbf69d8', 18, 32], // QmQNA1hhVyL1Vm6HiRxXe9xmc6LUMBDyiNMVgsjThtyevs"
      [2, 100, '0x1e1a168d736fc825213144973a8fd5b3cc9f37ad821a8b3d9c3488034bbf69d8', 18, 32] // QmQNA1hhVyL1Vm6HiRxXe9xmc6LUMBDyiNMVgsjThtyevs"
    ],
    vote: [
      [1]
    ]
  }
};
let ipfsContent = [
  {
    "@context": "https://schema.kosmos.org",
    "@type": "Contributor",
    "kind": "person",
    "name": "Râu Cao",
    "url": "https://sebastian.kip.pe",
    "accounts": [
      {
        "site": "github.com",
        "username": "skddc",
        "uid": 842,
        "url": "https://github.com/skddc/"
      },
    ]
  },
  {
    "@context": "https://schema.kosmos.org",
    "@type": "Contributor",
    "kind": "person",
    "name": "Bumi",
    "url": "https://michaelbumann.com",
    "accounts": [
      {
        "site": "github.com",
        "username": "bumi",
        "uid": 318,
        "url": "https://github.com/bumi/"
      },
    ]
  },
  {
    "@context": "https://schema.kosmos.org",
    "@type": "Contribution",
    "contributor": {
      "ipfs": "QmQ2ZZS2bXgneQfKtVTVxe6dV7pcJuXnTeZJQtoVUFsAtJ"
    },
    "kind": "dev",
    "description": "hacking hacking on kredits",
    "url": "https://github.com/67P/kredits-web/pull/11",
    "details": {}
  }

]

module.exports = { contractCalls, ipfsContent };
