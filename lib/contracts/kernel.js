const Base = require('./base');

KERNEL_APP_ADDR_NAMESPACE = '0xd6f028ca0e8edb4a8c9757ca4fdccab25fa1e0317da1188108f7d2dee14902fb';

class Kernel extends Base {

  getApp(appName) {
    return this.functions.getApp(KERNEL_APP_ADDR_NAMESPACE, this.appNamehash(appName));
  }

  appNamehash(appName) {
    return {
      Contributor: '0x7829d33291d6e118d115ce321de9341894a2da120bd35505fc03b98f715c606d',
      Contribution: '0xe401b988b8af39119004de5c7691a60391d69d873b3120682a8c61306a4883ce',
      Token: '0x85b0f626cecde6188d11940904fedeb16a4d49b0e8c878b9d109b23d38062ca7',
      Proposal: '0x15d03d435b24a74317868c24fda4646302076b59272241a122a3868eb5c745da'
    }[appName];
  }
}

module.exports = Kernel;
