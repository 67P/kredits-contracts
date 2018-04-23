let contractCalls = [
  ['Contributor', 'add', [{ account: '0x7e8f313c56f809188313aa274fa67ee58c31515d', name: 'bumi', isCore: true, kind: 'preson', url: '', github_username: 'bumi', github_uid: 318, wiki_username: 'bumi' }, {gasLimit: 200000}]],
  ['Contributor', 'add', [{ account: '0xa502eb4021f3b9ab62f75b57a94e1cfbf81fd827', name: 'raucau', isCore: true, kind: 'person', url: '', github_username: 'skddc', github_uid: 842, wiki_username: 'raucau' }, {gasLimit: 200000}]],
  ['Operator', 'addProposal', [{ contributorId: 2, amount: 42, kind: 'code', description: 'runs the seeds', url: '' }, {gasLimit: 350000}]],
  ['Operator', 'addProposal', [{ contributorId: 3, amount: 23, kind: 'code', description: 'runs the seeds', url: '' }, {gasLimit: 350000}]],
  ['Operator', 'addProposal', [{contributorId: 3, amount: 100, kind: 'code', description: 'hacks on kredits', url: '' }, {gasLimit: 350000}]],
  ['Operator', 'vote', ['1', {gasLimit: 250000}]]
];
let funds = [
  '0x7e8f313c56f809188313aa274fa67ee58c31515d',
  '0xa502eb4021f3b9ab62f75b57a94e1cfbf81fd827'
];
module.exports = { contractCalls, funds };
