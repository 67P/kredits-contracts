class IpfsPinner {
  constructor (kredits) {
    this.kredits = kredits;
  }

  pinAll () {
    return Promise.all([
      this.kredits.Contributor.pinIpfsHashes(),
      this.kredits.Contribution.pinIpfsHashes(),
    ]);
  }

  monitor (callback) {
    this.kredits.Contribution.on('ContributionAdded', (id) => {
      this.kredits.Contribution.getData(id)
        .then(data => { return this.kredits.ipfs.pin(data); })
        .then(callback);
    });
    this.kredits.Contributor.on('ContributorAdded', (id) => {
      this.kredits.Contribution.getData(id)
        .then(data => { return this.kredits.ipfs.pin(data); })
        .then(callback);
    });
    this.kredits.Contributor.on('ContributorProfileUpdated', (id) => {
      this.kredits.Contributor.getData(id)
        .then(data => { return this.kredits.ipfs.pin(data); })
        .then(callback);
    });
  }

}
module.exports = IpfsPinner;
