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

  pinIpfsHashes () {
    return this.count.then(count => {
      let promises = [...Array(count).keys()].map(i => {
        let id = i + 1; // 0 => 1 - ids start with 1 and not with 0
        return this.getData(id).then(data => {
          return this.ipfs.pin(data);
        });
      });
      return Promise.all(promises);
    });
  }
}

module.exports = Record;
