// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract AbstractContractState is Ownable, Pausable, ReentrancyGuard, AccessControl{
    enum PaymentType{ LOCK, PAY, PAY_PROPORTIONNAL }
    enum TriState{ UNDEFINED, FALSE, TRUE }
    enum Lifecycle{ DELETE,LIVE, PAUSED }
    using ECDSA for bytes32;
    bool internal validatorRequire;
    address internal validator;
    mapping(uint256 => bool) internal nonces;
    mapping(bytes32 => Price) public pricing;
    mapping(bytes32 => Lock) public locked;
    uint256 public lockCount;
    bytes32 internal constant ROLE_SUPER = keccak256("ROLE_SUPER");
    bytes32 internal constant ROLE_CONFIGURER = keccak256("ROLE_CONFIGURER");
    bytes32 internal constant ROLE_MANAGER = keccak256("ROLE_MANAGER");
    constructor() {
        _setupRole(ROLE_CONFIGURER, msg.sender);
        _setupRole(ROLE_MANAGER, msg.sender);
        _setupRole(ROLE_SUPER, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    struct Price {
        uint256 amount;
        bytes32 service;
        address currency;
        PaymentType paymentType;
    }

    struct Lock{
        uint256 amount;
        bytes32 service;
        address currency;
        uint256 serviceId;
        address payer;
        bool unlocked;
    }

    function getPrice(bytes32 service) public view returns (Price memory) { 
        Price storage price = pricing[service];
        return price;
    }
    
    function addPrice(bytes32 service, Price memory price) internal { 
        require(price.amount >= 0, "Price: missing price");
        price.service = service;
        pricing[service] = price;
    }
    function balanceCoin() external view onlyOwner returns (uint256) { 
        return address(this).balance;
    }
    function balanceToken(address _token) external view onlyOwner returns (uint256) { 
        return IERC20(_token).balanceOf(address(this));
    }
    function generateServiceKey(bytes32 service, uint256 serviceId) public pure returns (bytes32) { 
        return keccak256(abi.encode(service, serviceId));
    }
    //PUBLIC ACTION
    receive() external payable {
        //default payable function
    }
    //WITHDRAW

    
    function withdrawCoin() external onlyRole(ROLE_SUPER) returns (bool) {
        uint256 balance = address(this).balance;
        if(balance > 0){
            address payable wallet = payable(owner());
            bool res = wallet.send(balance);
            require(res==true, "Withdraw: transfer failed");
            return true;
        }
        return false;
    }
    
    function withdrawToken(address _token) external onlyRole(ROLE_SUPER) returns (bool) {
        IERC20 tokenContract = IERC20(_token);
        uint256 balance = tokenContract.balanceOf(address(this));
        if(balance > 0){
            address wallet = owner();
            bool res = tokenContract.transfer(wallet, balance);
            return res;
        }
        return false;
    }
}
