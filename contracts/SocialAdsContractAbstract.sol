// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//import "@openzeppelin/contracts/token/ERC777/IERC777Sender.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "./AbstractContractState.sol";
import "./SocialAdsContractInterface.sol";
//removed IERC777Sender
abstract contract SocialAdsContractAbstract is IERC777Recipient, AbstractContractState, IStructSocialAdsContract {
    IERC1820Registry internal _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    bytes32 constant internal SERVICE_ADS = keccak256("SERVICE_ADS");
    bytes32 constant internal SERVICE_ADS_PROPS = keccak256("SERVICE_ADS_PROPS");
    bytes32 constant internal TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");
    bytes32 internal constant _TOKENS_SENDER_INTERFACE_HASH = keccak256("ERC777TokensSender");    
    //PUBLIC
    uint256[] public adsIds;
    mapping(uint256 => Ads) public adsById;
    mapping(address => uint256[]) public myAds;
    mapping(uint256 => AdsProposition) public propositions;
    mapping(address => uint256[]) public myPropositions;
    mapping(uint256 => uint256[]) public propositionsByAds;
    //private
    Counters.Counter internal _adsCounter;
    Counters.Counter internal _propositionCounter;
    address internal tokenAddress;
    address internal libAddress;
    bool internal deleteDefinitely;
    //EVENTS
    event OnAds(address addr, Ads ads);
    event OnDeleteAds(address addr, Ads ads);
    event OnDeleteProposition(address addr, AdsProposition proposition);
    event OnProposition(address addr, AdsProposition proposition);
    event OnPropositionApprove(address addr, AdsProposition proposition, bool approve);
    event OnPropositionAllow(address addr, AdsProposition proposition, bool approve);
    event OnPropositionClaim(address addr, AdsProposition proposition);

    constructor(SocialConfig memory config) {
        setConfig(config);
        _erc1820.setInterfaceImplementer(address(this), TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
    }  

    //HOOK
    function tokensReceived(
        address operator,
        address from,
        address /*to*/,
        uint256 _amount,
        bytes calldata userData,
        bytes calldata /*operatorData*/
    ) external override {
        //if operator is not self
        if(operator != address(this)){
            //atomic send and ads 
            (Ads memory ads) = abi.decode(userData, (Ads));
            doCreateAds(ads, from, _amount, false);
        }
    }

    //CONFIG
    function socialConfig() external view returns (SocialConfig memory) {
        return SocialConfig({
            deleteDefinitely: deleteDefinitely,
            tokenAddress: tokenAddress,
            validator: validator,
            validatorRequire: validatorRequire,
            libAddress: libAddress,
            ads: getPrice(SERVICE_ADS),
            proposition: getPrice(SERVICE_ADS_PROPS)
        });
    }

    function setConfig(SocialConfig memory config) public onlyRole(ROLE_CONFIGURER) {
        tokenAddress =  config.tokenAddress;
        validator = config.validator;
        validatorRequire = config.validatorRequire;
        libAddress = config.libAddress;
        deleteDefinitely = config.deleteDefinitely;
        addPrice(SERVICE_ADS, config.ads);
        addPrice(SERVICE_ADS_PROPS, config.proposition);
    }

    //INERNAL
    function doCreateAds(Ads memory ads, address sender, uint256 amount, bool makeTransfer) internal virtual;

}