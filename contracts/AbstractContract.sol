// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./AbstractContractState.sol";

contract AbstractContract is AbstractContractState {
    using ECDSA for bytes32;

    //INTERNAL

    function startPayment(bytes32 service, uint256 serviceId, address currency, uint256 amount, address payer) internal {
        Price storage price = pricing[service];
        require(price.amount == amount, "Price: invalid price");
        require(price.currency == currency, "Price: invalid currency");
        require(payer != address(0), "Price: invalid payer");
        bytes32 key = generateServiceKey(service, serviceId);
        if(price.paymentType == PaymentType.LOCK){
            locked[key] = Lock({
                amount: amount,
                service: service,
                currency: currency,
                serviceId: serviceId,
                payer: payer,
                unlocked: false
            });
            lockCount++;
        }
    }

    function endPayment(bytes32 service, uint256 serviceId, address payer) internal {
        bytes32 key = generateServiceKey(service, serviceId);
        Lock storage lock = locked[key];
        if(lock.amount > 0 && lock.unlocked == false){
            require(payer == lock.payer, "Payment: only owner can unlock tokens");
            if(lock.currency == address(0)){
                bool res = payable(msg.sender).send(lock.amount);
                require(res==true, "Payment: transfer failed");
            }else{
                bool res = IERC20(lock.currency).transfer(lock.payer, lock.amount);
                require(res==true, "Payment: transfer failed");
            }
            lock.unlocked = true;
        }
    }

    function onlyValidator() internal view returns (bool) { 
        require(validator == msg.sender, "onlyValidator: only validator");
        return true;
    }
    function checkSignature(bytes memory data, bytes memory signature) internal view returns (bool) { 
        if(validatorRequire == true){
            address signer = keccak256(data).toEthSignedMessageHash().recover(signature);
            require(validator == signer, "checkSignature: Invalid signer");
        }
        return true;
    }
    function checkSignature(bytes memory data, bytes calldata signature, uint256 nonce) internal view returns (bool) { 
        require(nonces[nonce] == false, "checkSignature: Nonce already used");
        if(validatorRequire == true){
            address signer = keccak256(data).toEthSignedMessageHash().recover(signature);
            require(validator == signer, "checkSignature: Invalid signer");
        }
        return true;
    }
    //ADMIN ACTION
    function unlockPayment(bytes32 service, uint256 serviceId, address payer) external onlyRole(ROLE_MANAGER) {
        endPayment(service, serviceId, payer);
    }

    function pause() external onlyOwner returns (bool) {
        _pause();
        return paused();
    }

    function unpause() external onlyOwner returns (bool) {
        _unpause();
        return paused();
    }
    
    function removeByValue(uint256[] storage values, uint256 value) internal returns(uint) {
        if(values.length == 0){
            return 0;
        }
        uint i = 0;
        while (values[i] != value && i < values.length) {
            i++;
        }
        values[i] = values[values.length - 1];
        values.pop();
        return i;
    }

    function containsUint(uint256[] memory values, uint256 value) internal pure returns(bool) {
        for (uint i=0; i < values.length; i++) {
            if (value == values[i]) {
                return true;
            }
        }
        return false;
    }

    function containsAddress(address[] memory values, address value) internal pure returns(bool) {
        for (uint i=0; i < values.length; i++) {
            if (value == values[i]) {
                return true;
            }
        }
        return false;
    }
}
