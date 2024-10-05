// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;
import "./AbstractContract.sol";

interface SocialNameContractInterface {
    
    struct SocialNameConfig{
        address tokenAddress;
        AbstractContract.Price registration;
        AbstractContract.Price fee;
        AbstractContract.Price deposit;
        bool validatorRequire;
        address validator;
        bool allowChangeOwner;
        address libAddress;
    }

    struct Payment{
        uint256 id;
        uint256 date;
        bytes32 from;
        bytes32 to;
        uint256 amount;
        address currency;
        bool claimed;
        bool cancel;
    }

    struct PiggyBank{
        bytes32 id;
        uint256 date;
        uint256 amount;
        address currency;
        uint256 claimed;
        bool secure;
    }

    struct Registration{
        uint256 id;
        address owner;
        bytes32 name;
        uint256 network;
        bytes encryptName;
        bytes signature;
    }
}