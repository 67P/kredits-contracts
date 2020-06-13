pragma solidity 0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/acl/ACL.sol";

import "@aragon/kits-base/contracts/KitBase.sol";

import "../apps/contribution/contracts/Contribution.sol";
import "../apps/contributor/contracts/Contributor.sol";
import "../apps/token/contracts/Token.sol";
import "../apps/proposal/contracts/Proposal.sol";
import "../apps/reimbursement/contracts/Reimbursement.sol";

contract KreditsKit is KitBase {

    bytes32 constant internal CONTRIBUTION_APP_ID = 0x09f5274cba299b46c5be722ef672d10eef7a2ef980b612aef529d74fb9da7643;
    bytes32 constant internal CONTRIBUTOR_APP_ID = 0x8e50972b062e83b48dbb2a68d8a058f2a07227ca183c144dc974e6da3186d7e9;
    bytes32 constant internal PROPOSAL_APP_ID= 0xb48bc8b4e539823f3be98d67f4130c07b5d29cc998993debcdea15c6faf4cf8a;
    bytes32 constant internal REIMBURSEMENT_APP_ID = 0x1103c160cab5c23100981f67c020a021d46a894a4f262b6e1180b335a639d3d2;
    bytes32 constant internal TOKEN_APP_ID = 0x82c0e483537d703bb6f0fc799d2cc60d8f62edcb0f6d26d5571a92be8485b112;

    event DeployInstance(address dao);
    event InstalledApp(address dao, address appProxy, bytes32 appId);

    constructor (DAOFactory _fac, ENS _ens) public KitBase(_fac, _ens) {
    //  appIds = _appIds;
    }

    function newInstance() public returns (Kernel dao) {
        address root = msg.sender;
        dao = fac.newDAO(this);
        ACL acl = ACL(dao.acl());

        acl.createPermission(this, dao, dao.APP_MANAGER_ROLE(), this);

        Contribution contribution = Contribution(_installApp(dao, CONTRIBUTION_APP_ID));
        Contributor contributor = Contributor(_installApp(dao, CONTRIBUTOR_APP_ID));
        Proposal proposal = Proposal(_installApp(dao, PROPOSAL_APP_ID));
        Reimbursement reimbursement = Reimbursement(_installApp(dao,REIMBURSEMENT_APP_ID));
        Token token = Token(_installApp(dao, TOKEN_APP_ID));

        token.initialize();
        contributor.initialize(contribution, token);

        acl.createPermission(root, contributor, contributor.MANAGE_CONTRIBUTORS_ROLE(), this);

        contribution.initialize(token, contributor);

        acl.createPermission(root, contribution, contribution.ADD_CONTRIBUTION_ROLE(), this);
        acl.createPermission(root, contribution, contribution.VETO_CONTRIBUTION_ROLE(), this);
        acl.grantPermission(proposal, contribution, contribution.ADD_CONTRIBUTION_ROLE());

        proposal.initialize(contributor, contribution);

        reimbursement.initialize();
        acl.createPermission(root, reimbursement, reimbursement.ADD_REIMBURSEMENT_ROLE(), this);
        acl.createPermission(root, reimbursement, reimbursement.VETO_REIMBURSEMENT_ROLE(), this);

        uint256[] memory params = new uint256[](1);
        params[0] = uint256(203) << 248 | uint256(1) << 240 | uint240(contributor);
        acl.grantPermissionP(acl.ANY_ENTITY(), contribution, contribution.ADD_CONTRIBUTION_ROLE(), params);
        acl.grantPermissionP(acl.ANY_ENTITY(), contribution, contribution.VETO_CONTRIBUTION_ROLE(), params);
        acl.grantPermissionP(acl.ANY_ENTITY(), contributor, contributor.MANAGE_CONTRIBUTORS_ROLE(), params);

        //acl.setPermissionManager(this, proposal, proposal.VOTE_PROPOSAL_ROLE();
        acl.createPermission(root, proposal, proposal.VOTE_PROPOSAL_ROLE(), this);
        acl.grantPermissionP(acl.ANY_ENTITY(), proposal, proposal.VOTE_PROPOSAL_ROLE(), params);

        acl.createPermission(root, proposal, proposal.ADD_PROPOSAL_ROLE(), this);
        //acl.grantPermissionP(address(-1), proposal, proposal.ADD_PROPOSAL_ROLE(), params);
        acl.grantPermission(acl.ANY_ENTITY(), proposal, proposal.ADD_PROPOSAL_ROLE());

        acl.setPermissionManager(root, proposal, proposal.VOTE_PROPOSAL_ROLE());
        acl.setPermissionManager(root, proposal, proposal.ADD_PROPOSAL_ROLE());
        acl.setPermissionManager(root, contribution, contribution.ADD_CONTRIBUTION_ROLE());
        acl.setPermissionManager(root, contribution, contribution.VETO_CONTRIBUTION_ROLE());
        acl.setPermissionManager(root, contributor, contributor.MANAGE_CONTRIBUTORS_ROLE());
        acl.setPermissionManager(root, reimbursement, reimbursement.ADD_REIMBURSEMENT_ROLE());
        acl.setPermissionManager(root, reimbursement, reimbursement.VETO_REIMBURSEMENT_ROLE());

        acl.createPermission(root, token, token.MINT_TOKEN_ROLE(), this);
        acl.grantPermission(contribution, token, token.MINT_TOKEN_ROLE());
        acl.setPermissionManager(root, token, token.MINT_TOKEN_ROLE());

        cleanupDAOPermissions(dao, acl, root);

        emit DeployInstance(dao);
        return dao;
    }

    function _installApp(Kernel _dao, bytes32 _appId) internal returns (AragonApp) {
      address baseAppAddress = latestVersionAppBase(_appId);
      require(baseAppAddress != address(0), "App should be deployed");
      AragonApp appProxy = AragonApp(_dao.newAppInstance(_appId, baseAppAddress, new bytes(0), true));

      emit InstalledApp(_dao, appProxy, _appId);
      return appProxy;
    }
}
