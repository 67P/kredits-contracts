const Base = require('./base');

KERNEL_APP_ADDR_NAMESPACE = '0xd6f028ca0e8edb4a8c9757ca4fdccab25fa1e0317da1188108f7d2dee14902fb';

class Kernel extends Base {

  getApp(appName) {
    return this.functions.getApp(KERNEL_APP_ADDR_NAMESPACE, this.appNamehash(appName));
  }

  appNamehash(appName) {
    return {
      Contributor: '0x8e50972b062e83b48dbb2a68d8a058f2a07227ca183c144dc974e6da3186d7e9',
      Contribution: '0x09f5274cba299b46c5be722ef672d10eef7a2ef980b612aef529d74fb9da7643',
      Token: '0x82c0e483537d703bb6f0fc799d2cc60d8f62edcb0f6d26d5571a92be8485b112',
      Proposal: '0xb48bc8b4e539823f3be98d67f4130c07b5d29cc998993debcdea15c6faf4cf8a'
    }[appName];
  }
}

module.exports = Kernel;
