const contractCalls = [
  ['Contributor', 'add', [{
    account: '0x7e8f313c56f809188313aa274fa67ee58c31515d',
    name: 'bumi',
    kind: 'person',
    url: '',
    github_username: 'bumi',
    github_uid: 318,
    gitea_username: 'bumi',
    wiki_username: 'Bumi',
  }, { gasLimit: 200000 }]],

  ['Contributor', 'add', [{
    account: '0x49575f3DD9a0d60aE661BC992f72D837A77f05Bc',
    name: 'raucao',
    kind: 'person',
    url: '',
    github_username: 'skddc',
    github_uid: 842,
    gitea_username: 'raucao',
    wiki_username: 'Basti',
  }, { gasLimit: 200000 }]],

  ['Contributor', 'add', [{
    account: '0xF722709ECC3B05c19d02E82a2a4A4021B8F48C62',
    name: 'Manuel',
    kind: 'person',
    url: '',
    github_username: 'fsmanuel',
    github_uid: 54812,
    wiki_username: 'Manuel',
  }, { gasLimit: 200000 }]],

  ['Contribution', 'add', [{ contributorId: 1, contributorIpfsHash: 'QmWKCYGr2rSf6abUPaTYqf98urvoZxGrb7dbspFZA6oyVF', date: '2019-04-11', amount: 500, kind: 'dev', description: '[67P/kredits-contracts] Test this thing', url: '' }, { gasLimit: 350000 }]],
  ['Contribution', 'add', [{ contributorId: 2, contributorIpfsHash: 'QmcHzEeAM26HV2zHTf5HnZrCtCtGdEccL5kUtDakAB7ozB', date: '2019-04-11', amount: 1500, kind: 'dev', description: '[67P/kredits-web] Reviewed stuff', url: '' }, { gasLimit: 350000 }]],
  ['Contribution', 'add', [{ contributorId: 1, contributorIpfsHash: 'QmWKCYGr2rSf6abUPaTYqf98urvoZxGrb7dbspFZA6oyVF', date: '2019-04-11', amount: 1500, kind: 'dev', description: '[67P/kredits-contracts] Add tests', url: '' }, { gasLimit: 350000 }]],
  ['Contribution', 'add', [{ contributorId: 1, contributorIpfsHash: 'QmWKCYGr2rSf6abUPaTYqf98urvoZxGrb7dbspFZA6oyVF', date: '2019-04-11', amount: 1500, kind: 'dev', description: '[67P/kredits-contracts] Introduce contribution token', url: '' }, { gasLimit: 350000 }]],
  ['Contribution', 'add', [{ contributorId: 2, contributorIpfsHash: 'QmcHzEeAM26HV2zHTf5HnZrCtCtGdEccL5kUtDakAB7ozB', date: '2019-04-11', amount: 5000, kind: 'dev', description: '[67P/kredits-web] Expense UI, first draft', url: '' }, { gasLimit: 350000 }]],

  ['Reimbursement', 'add', [{amount: 1116000, contributorId: 1, token: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', expenses: [
    { title: 'Server rent', description: 'Dedicated server: andromeda.kosmos.org, April 2020', amount: 61, currency: 'EUR', date: '2020-05-28' },
    { title: 'Server rent', description: 'Dedicated server: centaurus.kosmos.org, April 2020', amount: 32, currency: 'EUR', date: '2020-05-28' }
  ]}, { gasLimit: 300000 }]],
  ['Reimbursement', 'add', [{amount: 166800, recipientId: 2, token: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', expenses: [
    { title: 'Domain kosmos.chat', description: 'Yearly registration fee for domain kosmos.chat', amount: 13.90, currency: 'EUR', date: '2020-05-30' }
  ]}, { gasLimit: 300000 }]],
];

const funds = [
  '0x7e8f313c56f809188313aa274fa67ee58c31515d',
  '0xa502eb4021f3b9ab62f75b57a94e1cfbf81fd827',
];

module.exports = { contractCalls, funds };
