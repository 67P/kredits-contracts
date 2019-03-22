pragma solidity 0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/acl/ACL.sol";
import "@aragon/os/contracts/acl/ACLSyntaxSugar.sol";

import "@aragon/kits-base/contracts/KitBase.sol";
import "./misc/APMNamehashOpen.sol";

import "../apps/contribution/contracts/Contribution.sol";
import "../apps/contributor/contracts/Contributor.sol";
import "../apps/token/contracts/Token.sol";
import "../apps/proposal/contracts/Proposal.sol";

contract KreditsKit is KitBase, APMNamehashOpen, ACLSyntaxSugar  {
    bytes32 public contributorAppId = apmNamehash("contributor"); // 0xe9140f1e39c8a1d04167c3b710688a3eecea2976f34735c8eb98956f4764635b
    bytes32 public contributionAppId = apmNamehash("contribution"); // 0x7fcf91283b719b30c2fa954ff0da021e1b91aed09d7aa13df5e8078a4a1007eb 
    bytes32 public tokenAppId = apmNamehash("token"); // 0xe04a882e7a6adf5603207d545ea49aec17e6b936c4d9eae3d74dbe482264991a 
    bytes32 public proposalAppId = apmNamehash("proposal"); // 0xaf5fe5c3b0d9581ee88974bbc8699e6fa71efd1b321e44b2227103c9ef21dbdb 


    event DeployInstance(address dao);
    event InstalledApp(address dao, address appProxy, bytes32 appId);

    constructor (DAOFactory _fac, ENS _ens) public KitBase(_fac, _ens) {}

    function newInstance() public returns (Kernel dao, ERCProxy proxy) {
        address root = msg.sender;
        dao = fac.newDAO(this);
        ACL acl = ACL(dao.acl());

        acl.createPermission(this, dao, dao.APP_MANAGER_ROLE(), this);

        Contributor contributor = Contributor(_installApp(dao, contributorAppId));
        contributor.initialize(root);
        acl.createPermission(root, contributor, contributor.MANAGE_CONTRIBUTORS_ROLE(), root);
        
        Token token = Token(_installApp(dao, tokenAppId));
        token.initialize();
        
        Contribution contribution = Contribution(_installApp(dao, contributionAppId));
        contribution.initialize();
        
        Proposal proposal = Proposal(_installApp(dao, proposalAppId));
        proposal.initialize();

        acl.createPermission(root, contribution, contribution.ADD_CONTRIBUTION_ROLE(), this);
        acl.grantPermission(proposal, contribution, contribution.ADD_CONTRIBUTION_ROLE());
        
        uint256[] memory params = new uint256[](1);
        params[0] = uint256(203) << 248 | uint256(1) << 240 | uint240(contributor);
        acl.grantPermissionP(root, contribution, contribution.ADD_CONTRIBUTION_ROLE(), params);

        //acl.setPermissionManager(this, proposal, proposal.VOTE_PROPOSAL_ROLE();
        acl.createPermission(root, proposal, proposal.VOTE_PROPOSAL_ROLE(), this);
        acl.grantPermissionP(root, proposal, proposal.VOTE_PROPOSAL_ROLE(), params);
        
        acl.createPermission(root, proposal, proposal.ADD_PROPOSAL_ROLE(), this);
        acl.grantPermissionP(root, proposal, proposal.ADD_PROPOSAL_ROLE(), params);

        acl.setPermissionManager(root, proposal, proposal.VOTE_PROPOSAL_ROLE());
        acl.setPermissionManager(root, proposal, proposal.ADD_PROPOSAL_ROLE());
        acl.setPermissionManager(root, contribution, contribution.ADD_CONTRIBUTION_ROLE());
        
        acl.createPermission(root, token, token.MINT_TOKEN_ROLE(), this);
        acl.grantPermission(contribution, token, token.MINT_TOKEN_ROLE());        
        acl.setPermissionManager(root, token, token.MINT_TOKEN_ROLE());


        cleanupDAOPermissions(dao, acl, root);

        emit DeployInstance(dao);
        //return dao;
    }

    function _installApp(Kernel _dao, bytes32 _appId) internal returns (AragonApp) {
      address baseAppAddress = latestVersionAppBase(_appId);
      require(baseAppAddress != address(0), "App should be deployed");
      AragonApp appProxy = AragonApp(_dao.newAppInstance(_appId, baseAppAddress, new bytes(0), true));

      emit InstalledApp(_dao, appProxy, _appId);
      return appProxy;
    }
}
