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
    const recipientId = attrs.recipientId;
    const expenses = attrs.expenses.map( e => new ExpenseSerializer(e) );
    let errorMessage;

    if (typeof amount !== 'number' || amount <= 0) {
      errorMessage = 'Invalid data: amount must be a positive number.';
    }
    if (!token || token === '') {
      errorMessage = 'Invalid data: token must be a token address.';
    }
    if (!recipientId || recipientId === '') {
      errorMessage = 'Invalid data: recipientId is required.';
    }
    if (expenses.length === 0) {
      errorMessage = 'Invalid data: at least one expense item is required.';
    }
    if (errorMessage) { return Promise.reject(new Error(errorMessage)); }

    return Promise.all(expenses.map(e => e.validate()))
      .then(() => {
        const jsonStr = JSON.stringify(expenses.map(e => e.data), null, 2);
        return this.ipfs
          .add(jsonStr)
          .then(ipfsHashAttr => {
            const reimbursement = [
              amount,
              token,
              parseInt(recipientId),
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
