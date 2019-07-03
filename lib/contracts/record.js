const Base = require('./base');
const paged = require('../utils/pagination');

class Record extends Base {
  all (options = {}) {
    return this.count
      .then((count) => {
        let records = paged(count, options).map((id) => this.getById(id));
        return Promise.all(records);
      });
  }
}

module.exports = Record;
