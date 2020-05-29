const Record = require('./record');
const ExpenseSerializer = require('../serializers/expense');

class Reimbursement extends Record {
  get count () {
    return this.functions.reimbursementsCount();
  }

  getById (id) {
    return this.functions.get(id)
      .then(data => {
        return this.ipfs.catAndMerge(data, ExpenseSerializer.deserialize);
      });
  }

  getData (id) {
    return this.functions.getReimbursement(id);
  }

  async add (attrs, callOptions = {}) {
    const reimbursement = new ExpenseSerializer(attrs);

    try { await reimbursement.validate(); }
    catch (error) { return Promise.reject(error); }

    const jsonStr = reimbursement.serialize();

    return this.ipfs
      .add(jsonStr)
      .then(ipfsHashAttr => {
        let reimbursement = [
          attrs.amount,
          attrs.token,
          ipfsHashAttr.hashDigest,
          ipfsHashAttr.hashFunction,
          ipfsHashAttr.hashSize,
        ];

        console.log(reimbursement)
        return this.functions.add(...reimbursement, callOptions);
      });
  }
}

module.exports = Reimbursement;
