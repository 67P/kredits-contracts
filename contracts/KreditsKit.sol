pragma solidity 0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/acl/ACL.sol";

import "@aragon/kits-base/contracts/KitBase.sol";

import "../apps/contribution/contracts/Contribution.sol";
import "../apps/contributor/contracts/Contributor.sol";
import "../apps/token/contracts/Token.sol";
import "../apps/proposal/contracts/Proposal.sol";

contract KreditsKit is KitBase  {

    // ensure alphabetic order
    enum Apps { Contribution, Contributor, Proposal, Token }
    bytes32[4] public appIds;

    event DeployInstance(address dao);
    event InstalledApp(address dao, address appProxy, bytes32 appId);

    constructor (DAOFactory _fac, ENS _ens, bytes32[4] _appIds) public KitBase(_fac, _ens) {
      appIds = _appIds;
    }

    function newInstance() public returns (Kernel dao) {
        address root = msg.sender;
        dao = fac.newDAO(this);
        ACL acl = ACL(dao.acl());

        acl.createPermission(this, dao, dao.APP_MANAGER_ROLE(), this);

        Contributor contributor = Contributor(_installApp(dao, appIds[uint8(Apps.Contributor)]));
        contributor.initialize(root, appIds);
        acl.createPermission(root, contributor, contributor.MANAGE_CONTRIBUTORS_ROLE(), root);
        
        Token token = Token(_installApp(dao, appIds[uint8(Apps.Token)]));
        token.initialize(appIds);
        
        Contribution contribution = Contribution(_installApp(dao, appIds[uint8(Apps.Contribution)]));
        contribution.initialize(appIds);
        
        Proposal proposal = Proposal(_installApp(dao, appIds[uint8(Apps.Proposal)]));
        proposal.initialize(appIds);

        acl.createPermission(root, contribution, contribution.ADD_CONTRIBUTION_ROLE(), this);
        acl.createPermission(root, contribution, contribution.VETO_CONTRIBUTION_ROLE(), this);
        acl.grantPermission(proposal, contribution, contribution.ADD_CONTRIBUTION_ROLE());
        
        uint256[] memory params = new uint256[](1);
        params[0] = uint256(203) << 248 | uint256(1) << 240 | uint240(contributor);
        acl.grantPermissionP(acl.ANY_ENTITY(), contribution, contribution.ADD_CONTRIBUTION_ROLE(), params);
        acl.grantPermissionP(acl.ANY_ENTITY(), contribution, contribution.VETO_CONTRIBUTION_ROLE(), params);

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
