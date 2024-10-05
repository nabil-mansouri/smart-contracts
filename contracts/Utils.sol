// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
library Utils{
    using ECDSA for bytes32;

    function generateServiceKey(bytes32 service, uint256 serviceId) public pure returns (bytes32) { 
        bytes32 key = keccak256(abi.encode(service, serviceId));
        return key;
    }
    
    function checkSignature(bool validatorRequire,address validator, bytes memory data, bytes memory signature) public pure returns (bool) { 
        if(validatorRequire == true){
            address signer = keccak256(data).toEthSignedMessageHash().recover(signature);
            require(validator == signer, "checkSignature: Invalid signer");
        }
        return true;
    }

    function memcmp(bytes memory a, bytes memory b) public pure returns(bool){
        return (a.length == b.length) && (keccak256(a) == keccak256(b));
    }

    function strcmp(string memory a, string memory b) public pure returns(bool){
        return memcmp(bytes(a), bytes(b));
    }

    function containsUint(uint256[] memory values, uint256 value) public pure returns(bool) {
        for (uint i=0; i < values.length; i++) {
            if (value == values[i]) {
                return true;
            }
        }
        return false;
    }

    function containsAddress(address[] memory values, address value) public pure returns(bool) {
        for (uint i=0; i < values.length; i++) {
            if (value == values[i]) {
                return true;
            }
        }
        return false;
    }
}