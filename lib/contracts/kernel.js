const Base = require('./base');

KERNEL_APP_ADDR_NAMESPACE = '0xd6f028ca0e8edb4a8c9757ca4fdccab25fa1e0317da1188108f7d2dee14902fb';

class Kernel extends Base {

  getApp(appName) {
    return this.functions.getApp(KERNEL_APP_ADDR_NAMESPACE, this.appNamehash(appName));
  }

  appNamehash(appName) {
    return {
      Contributor: '0xe9140f1e39c8a1d04167c3b710688a3eecea2976f34735c8eb98956f4764635b',
      Contribution: '0x7fcf91283b719b30c2fa954ff0da021e1b91aed09d7aa13df5e8078a4a1007eb',
      Token: '0xe04a882e7a6adf5603207d545ea49aec17e6b936c4d9eae3d74dbe482264991a',
      Proposal: '0xaf5fe5c3b0d9581ee88974bbc8699e6fa71efd1b321e44b2227103c9ef21dbdb'
    }[appName];
  }
}

module.exports = Kernel;
