// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//import "@openzeppelin/contracts/token/ERC777/IERC777Sender.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./AbstractContract.sol";
import "./SocialNameContractInterface.sol";
import "./MessageContractAbstract.sol";
//removed IERC777Sender
abstract contract SocialNameContractAbstract is IERC777Recipient, AbstractContract, SocialNameContractInterface, MessageContractAbstract {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    IERC1820Registry internal _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    bytes32 constant internal SERVICE_REGISTRATION = keccak256("SERVICE_REGISTRATION");
    bytes32 constant internal SERVICE_FEE = keccak256("SERVICE_FEE");
    bytes32 constant internal SERVICE_DEPOSIT = keccak256("SERVICE_DEPOSIT");
    bytes32 constant internal TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");
    bytes32 constant internal _TOKENS_SENDER_INTERFACE_HASH = keccak256("ERC777TokensSender");
    uint256 public registrationCount;
    mapping(uint256 => Registration) public registrationsById;
    mapping(bytes32 => uint256) public registrationsByName;
    mapping(address => uint256[]) public registrationsOwner;
    mapping(uint256 => Payment) public paymantById;
    mapping(bytes32 => uint256[]) public paymentReceived;
    mapping(bytes32 => uint256[]) public paymentSent;
    mapping(bytes32 => PiggyBank) public piggyBankById;
    //private
    address internal libAddress;
    address internal tokenAddress;
    bool internal allowChangeOwner;
    Counters.Counter internal _registrationCounter;
    Counters.Counter internal _paymentCounter;
    //EVENTS
    event OnRegister(address addr, Registration registration);
    event OnUnRegister(address addr, Registration registration);

    constructor(SocialNameConfig memory config) {
        setConfig(config);
        _erc1820.setInterfaceImplementer(address(this), TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
        //_erc1820.setInterfaceImplementer(address(this), _TOKENS_SENDER_INTERFACE_HASH, address(this));
    }

    function socialConfig() public view returns (SocialNameConfig memory) {
        return SocialNameConfig({
            tokenAddress: tokenAddress,
            fee: getPrice(SERVICE_FEE),
            deposit: getPrice(SERVICE_DEPOSIT),
            registration: getPrice(SERVICE_REGISTRATION),
            validator: validator,
            validatorRequire: validatorRequire,
            allowChangeOwner: allowChangeOwner,
            libAddress: libAddress
        });
    }

    function setConfig(SocialNameConfig memory config) public nonReentrant onlyRole(ROLE_CONFIGURER) returns (bool) {
        tokenAddress =  config.tokenAddress;
        validator = config.validator;
        validatorRequire = config.validatorRequire;
        allowChangeOwner = config.allowChangeOwner;
        libAddress = config.libAddress;
        messageLibAddress = config.libAddress;
        addPrice(SERVICE_REGISTRATION, config.registration);
        addPrice(SERVICE_FEE, config.fee);
        addPrice(SERVICE_DEPOSIT, config.deposit);
        return true;
    }

    function piggyBankHash(address _addr, address _currency) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_addr, _currency));
    }

    function piggyBankHashSecure(bytes32 _hash, bool _secure) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_hash, _secure));
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
            (Registration memory registration) = abi.decode(userData, (Registration));
            doRegister(from, registration, _amount, false); 
        }
    }

    //PRIVATE
    function doRegister(address owner, Registration memory original, uint256 amount, bool makeTransfer) internal virtual;
}