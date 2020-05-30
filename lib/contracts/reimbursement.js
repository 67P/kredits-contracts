const Record = require('./record');
const ExpenseSerializer = require('../serializers/expense');

class Reimbursement extends Record {
  get count () {
    return this.functions.reimbursementsCount();
  }

  getById (id) {
    return this.functions.get(id)
      .then(data => {
        return this.ipfs.catAndMerge(data, (ipfsDocument) => {
          const expenses = JSON.parse(ipfsDocument);
          return { expenses };
        });
      });
  }

  getData (id) {
    return this.functions.getReimbursement(id);
  }

  async add (attrs, callOptions = {}) {
    const amount = parseInt(attrs.amount);
    const token = attrs.token;
    const recipient = attrs.recipient;
    const expenses = attrs.expenses.map( e => new ExpenseSerializer(e) );

    if (!amount > 0 || !token || token === '' || !recipient || recipient === '' || !expenses.length > 0) {
      return Promise.reject(new Error('Invalid data. amount, token, expenses is required.'));
    }

    return Promise.all(expenses.map(e => e.validate()))
      .then(() => {
        const jsonStr = JSON.stringify(expenses.map(e => e.data), null, 2);
        return this.ipfs
          .add(jsonStr)
          .then(ipfsHashAttr => {
            const reimbursement = [
              amount,
              token,
              recipient,
              ipfsHashAttr.hashDigest,
              ipfsHashAttr.hashFunction,
              ipfsHashAttr.hashSize,
            ];

            return this.functions.add(...reimbursement, callOptions);
          });
      });
  }
}

module.exports = Reimbursement;
