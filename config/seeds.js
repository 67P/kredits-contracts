const contractCalls = [
  ['Contributor', 'add', [{ account: '0x7e8f313c56f809188313aa274fa67ee58c31515d', name: 'bumi', kind: 'person', url: '', github_username: 'bumi', github_uid: 318, wiki_username: 'Bumi' }, { gasLimit: 200000 }]],
  ['Contributor', 'add', [{ account: '0x49575f3DD9a0d60aE661BC992f72D837A77f05Bc', name: 'raucao', kind: 'person', url: '', github_username: 'skddc', github_uid: 842, wiki_username: 'Basti' }, { gasLimit: 200000 }]],
  ['Contributor', 'add', [{ account: '0xF722709ECC3B05c19d02E82a2a4A4021B8F48C62', name: 'Manuel', kind: 'person', url: '', github_username: 'fsmanuel', github_uid: 54812, wiki_username: 'Manuel' }, { gasLimit: 200000 }]],
  ['Proposal', 'addProposal', [{ contributorId: 1, contributorIpfsHash: 'QmWKCYGr2rSf6abUPaTYqf98urvoZxGrb7dbspFZA6oyVF', date: '2019-04-09', amount: 500, kind: 'dev', description: '[67P/kredits-contracts] Ran the seeds', url: '' }, { gasLimit: 350000 }]],
  ['Proposal', 'addProposal', [{ contributorId: 2, contributorIpfsHash: 'QmcHzEeAM26HV2zHTf5HnZrCtCtGdEccL5kUtDakAB7ozB', date: '2019-04-10', amount: 500, kind: 'dev', description: '[67P/kredits-contracts] Ran the seeds', url: '' }, { gasLimit: 350000 }]],
  ['Proposal', 'addProposal', [{ contributorId: 2, contributorIpfsHash: 'QmcHzEeAM26HV2zHTf5HnZrCtCtGdEccL5kUtDakAB7ozB', date: '2019-04-11', amount: 500, kind: 'dev', description: '[67P/kredits-contracts] Hacked on kredits', url: '' }, { gasLimit: 350000 }]],
  ['Proposal', 'vote', [1, { gasLimit: 550000 }]],
  ['Contribution', 'addContribution', [{ contributorId: 1, contributorIpfsHash: 'QmWKCYGr2rSf6abUPaTYqf98urvoZxGrb7dbspFZA6oyVF', date: '2019-04-11', amount: 5000, kind: 'dev', description: '[67P/kredits-contracts] Introduce contribution token', url: '' }, { gasLimit: 350000 }]],
  ['Contribution', 'addContribution', [{ contributorId: 2, contributorIpfsHash: 'QmcHzEeAM26HV2zHTf5HnZrCtCtGdEccL5kUtDakAB7ozB', date: '2019-04-11', amount: 1500, kind: 'dev', description: '[67P/kredits-web] Reviewed stuff', url: '' }, { gasLimit: 350000 }]],
  ['Contribution', 'claim', [1, { gasLimit: 300000 }]]
];

const funds = [
  '0x7e8f313c56f809188313aa274fa67ee58c31515d',
  '0xa502eb4021f3b9ab62f75b57a94e1cfbf81fd827'
];

module.exports = { contractCalls, funds };
