// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;
import "./SocialNameContractAbstract.sol";
import "./AbstractContract.sol";
import "./MessageContractProxy.sol";
//removed IERC777Sender
contract SocialNameContractProxy is SocialNameContractAbstract, MessageContractProxy {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    
    constructor(SocialNameConfig memory config) SocialNameContractAbstract(config) {}  
    //VIEWS
    function prepareSignature(address owner, bytes32 _hash) public view returns (bytes32) {
        return keccak256(abi.encode(owner, _hash, address(this)));
    }

    function generateUserData(Registration calldata cam) external pure returns (bytes memory) {
        return abi.encode(cam);
    }

    function listPaymentReceivedForMe(TriState claimed) public view returns (Payment[][] memory) {
        return listPaymentReceivedForAddress(msg.sender, claimed);
    }

    function listPaymentReceivedForAddress(address _addr, TriState claimed) public view returns (Payment[][] memory) {
        uint256[] storage ids = registrationsOwner[_addr];
        uint len = ids.length;
        uint index = 0;
        Payment[][] memory result = new Payment[][](len);
        for (uint j = 0; j < len; j++) {
            uint256 id = ids[j];
            Registration storage reg = registrationsById[id];
            Payment[] memory tmp = listPaymentReceivedForHash(reg.name,claimed);
            result[index++] = tmp;
        }
        return result;
    }

    function listPaymentReceivedForHash(bytes32 _hash, TriState claimed) public view returns (Payment[] memory) {
        uint256[] storage ids = paymentReceived[_hash];
        uint len = ids.length;
        uint index = 0;
        Payment[] memory result = new Payment[](len);
        for (uint j = 0; j < len; j++) {
            uint256 id = ids[j];
            Payment storage tmp = paymantById[id];
            if(claimed == TriState.UNDEFINED){
                result[index++] = tmp;
            } else if(claimed == TriState.FALSE && tmp.claimed == false){
                result[index++] = tmp;
            } else if(claimed == TriState.TRUE && tmp.claimed == true){
                result[index++] = tmp;
            }
        }
        return result;
    }

    function listPaymentSendForMe(TriState claimed) public view returns (Payment[] memory) {
        return listPaymentSendForAddress(msg.sender, claimed);
    }

    function listPaymentSendForAddress(address _addr, TriState claimed) public view returns (Payment[] memory) {
        bytes32 senderHash = keccak256(abi.encodePacked(_addr));
        uint256[] storage ids = paymentSent[senderHash];
        uint len = ids.length;
        uint index = 0;
        Payment[] memory result = new Payment[](len);
        for (uint j = 0; j < len; j++) {
            uint256 id = ids[j];
            Payment storage tmp = paymantById[id];
            if(claimed == TriState.UNDEFINED){
                result[index++] = tmp;
            } else if(claimed == TriState.FALSE && tmp.claimed == false){
                result[index++] = tmp;
            } else if(claimed == TriState.TRUE && tmp.claimed == true){
                result[index++] = tmp;
            }
        }
        return result;
    }

    function seeRegistration(address addr) public view returns (Registration[] memory) {
        uint256[] storage ids = registrationsOwner[addr];
        uint len = ids.length;
        uint index = 0;
        Registration[] memory result = new Registration[](len);
        for (uint j = 0; j < len; j++) {
            uint256 id = ids[j];
            Registration storage tmp = registrationsById[id];
            result[index++] = tmp;
        }
        return result;
    }


    function seeRegistrationIds(address addr) public view returns (uint256[] memory) {
        uint256[] memory ids = registrationsOwner[addr];
        return ids;
    }
    
    //ADMIN ACTION
    function createRegistration(Registration memory original) external onlyRole(ROLE_MANAGER) {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("createRegistration((uint256,address,bytes32,uint256,bytes,bytes))", original)
        );
        require(success, string(data));
    }

    function deleteRegistration(bytes32 _hash) external onlyRole(ROLE_MANAGER) {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("deleteRegistration(bytes32)", _hash)
        );
        require(success, string(data));
    }
    
    //PUBLIC ACTIONS
    function claimAll(bytes32 _hash) external whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("claimAll(bytes32)", _hash)
        );
        require(success, string(data));
    }

    function claimOne(bytes32 _hash, uint256 paymentId) external whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("claimOne(bytes32,uint256)", _hash,paymentId)
        );
        require(success, string(data));
    }

    function cancelOne(uint256 paymentId) external whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("cancelOne(uint256)",paymentId)
        );
        require(success, string(data));
    }

    function sendCoin(bytes32 _hash, bool eventIfNotExist) external payable {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("sendCoin(bytes32,bool)", _hash,eventIfNotExist)
        );
        require(success, string(data));
    }

    function send(bytes32 _hash, address _token, uint256 amount, bool eventIfNotExist) external payable {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("send(bytes32,address,uint256,bool)", _hash, _token, amount,eventIfNotExist)
        );
        require(success, string(data));
    }

    function register(Registration memory registration) external {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("register((uint256,address,bytes32,uint256,bytes,bytes))", registration)
        );
        require(success, string(data));
    }

    function updateRegistration(uint256 id, address newOwner, bytes32 newName, bytes memory newEncryptName, bytes calldata signature) external  whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("updateRegistration(uint256,address,bytes32,bytes,bytes)", id, newOwner, newName, newEncryptName, signature)
        );
        require(success, string(data));
    }

    function unregister(uint256 id) external  whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("unregister(uint256)", id)
        );
        require(success, string(data));
    }

    function depositCoin(bytes32 piggyBankHash, bool secure) external payable whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("depositCoin(bytes32,bool)", piggyBankHash,secure)
        );
        require(success, string(data));
    }

    function depositToken(bytes32 piggyBankHash, bool secure, address _token, uint256 amount) external payable whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("depositToken(bytes32,bool,address,uint256)", piggyBankHash,secure,_token,amount)
        );
        require(success, string(data));
    }

    function claimPiggybank(bytes32 _piggyBankHash, bool secure) public whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("claimPiggybank(bytes32,bool)", _piggyBankHash,secure)
        );
        require(success, string(data));
    }

    //PRIVATE
    function doRegister(address owner, Registration memory original, uint256 amount, bool makeTransfer) internal override  whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("doRegisterPublic(address,(uint256,address,bytes32,uint256,bytes,bytes),uint256,bool)", owner, original, amount, makeTransfer)
        );
        require(success, string(data));
    }
}