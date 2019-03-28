const AppIds = require('../app_ids.json');
const Base = require('./base');
KERNEL_APP_ADDR_NAMESPACE = '0xd6f028ca0e8edb4a8c9757ca4fdccab25fa1e0317da1188108f7d2dee14902fb';

class Kernel extends Base {

  getApp(appName) {
    if (appName === 'Acl') {
      return this.functions.acl();
    }
    return this.functions.getApp(KERNEL_APP_ADDR_NAMESPACE, this.appNamehash(appName));
  }

  appNamehash(appName) {
    return AppIds[this.contract.provider.chainId.toString()][appName];
  }
}

module.exports = Kernel;
