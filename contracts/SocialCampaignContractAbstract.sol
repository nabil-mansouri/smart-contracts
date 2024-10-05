// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Counters.sol";
//import "@openzeppelin/contracts/token/ERC777/IERC777Sender.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "./AbstractContractState.sol";
import "./SocialCampaignContractInterface.sol";

//removed IERC777Sender
abstract contract SocialCampaignContractAbstract is IERC777Recipient, AbstractContractState, IStructSocialCampaignContract {
    using Counters for Counters.Counter;
    IERC1820Registry internal _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    bytes32 constant internal SERVICE_CAMPAIGN = keccak256("SERVICE_CAMPAIGN");
    bytes32 constant internal TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");
    //bytes32 private constant _TOKENS_SENDER_INTERFACE_HASH = keccak256("ERC777TokensSender");
    //public
    uint256[] public campaignIds;
    mapping(uint256 => Campaign) internal campaigns;
    mapping(address => uint256[]) public myCampaigns;
    mapping(uint256 => CampaignParticipant) public participants;
    mapping(address => uint256[]) public myParticipations;
    mapping(uint256 => uint256[]) public participantsByCampaign;
    //private
    Counters.Counter internal _campaignCounter;
    Counters.Counter internal _participantCounter;
    address internal tokenAddress;
    address internal libAddress;
    bool internal deleteDefinitely;
    //EVENTS
    event OnCampaign(address addr, Campaign campaign);
    event OnDeleteCampaign(address addr, Campaign campaign);
    event OnClaim(address addr, CampaignParticipant participant);
    event OnAllowClaim(address addr, CampaignParticipant participant);
    event OnParticipate(address addr, CampaignParticipant participant);

    constructor(SocialCampaignConfig memory config) {
        setConfig(config);
        _erc1820.setInterfaceImplementer(address(this), TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
        //_erc1820.setInterfaceImplementer(address(this), _TOKENS_SENDER_INTERFACE_HASH, address(this));
    }  
    //HOOKS

    function tokensReceived(
        address operator,
        address from,
        address /*to*/,
        uint256 _amount,
        bytes calldata userData,
        bytes calldata /*operatorData*/
    ) external override {
        //if operator is not self and token sent is not token nameServiced and token can be exchanged
        if(operator != address(this)){
            //atomic send and campaign
            (Campaign memory campaign) = abi.decode(userData, (Campaign));
            doCreateCampaign(campaign, from, _amount, false);
        }
    }

    //CONFIG
    function socialConfig() external view returns (SocialCampaignConfig memory) {
        return SocialCampaignConfig({
            libAddress: libAddress,
            deleteDefinitely: deleteDefinitely,
            tokenAddress: tokenAddress,
            validator: validator,
            validatorRequire: validatorRequire,
            campaign: getPrice(SERVICE_CAMPAIGN)
        });
    }
    
    function setConfig(SocialCampaignConfig memory config) public onlyRole(ROLE_CONFIGURER) {
        tokenAddress =  config.tokenAddress;
        validator = config.validator;
        validatorRequire = config.validatorRequire;
        libAddress = config.libAddress;
        deleteDefinitely = config.deleteDefinitely;
        addPrice(SERVICE_CAMPAIGN, config.campaign);
    }

    function doCreateCampaign(Campaign memory campaign, address sender, uint256 amount, bool makeTransfer) internal virtual;
}