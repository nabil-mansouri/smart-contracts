// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;

import "./MessageContractAbstract.sol";

//removed IERC777Sender
contract MessageContractProxy is MessageContractAbstract, MessageContractViewInterface {
    using Counters for Counters.Counter;
    
    function messageSubjectHash(bytes memory _addr) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_addr));
    }

    function counMessage() override external view returns (uint256){
        return _messageCounter.current();
    }
    
    function counMessageReceivedBy(address _addr) override public view returns (uint256){
        return messageByReceiver[messageAddressHash(_addr)].length;
    }
    
    function counMessageSentBy(address _addr) override public view returns (uint256){
        return messageBySender[messageAddressHash(_addr)].length;
    }
    
    function counMessageReceivedByMe() override external view returns (uint256){
        return counMessageReceivedBy(msg.sender);
    }
    
    function counMessageSentByMe() override external view returns (uint256){
        return counMessageSentBy(msg.sender);
    }
    
    function listMessageBySubject(bytes32 _id,uint256 start, uint256 limit) override external view returns (Message[] memory){
        return messageFromId(messageBySubjectId[_id], start, limit);
    }
    
    function listMessageReceivedBy(address _addr,uint256 start, uint256 limit) override public view returns (Message[] memory){
        return messageFromId(messageByReceiver[messageAddressHash(_addr)], start, limit);
    }
    
    function listMessageSentBy(address _addr,uint256 start, uint256 limit) override public view returns (Message[] memory){
        return messageFromId(messageBySender[messageAddressHash(_addr)], start, limit);
    }
    
    function listMessageReceivedByMe(uint256 start, uint256 limit) override external view returns (Message[] memory){
        return listMessageReceivedBy(msg.sender, start, limit);
    }
    
    function listMessageSentByMe(uint256 start, uint256 limit) override external view returns (Message[] memory){
        return listMessageSentBy(msg.sender, start, limit);
    }

    function listMessageSubjectBy(address _addr,uint256 start, uint256 limit) override public view returns (bytes32[] memory){
        return messageSubjectFromId(messageSubjectByAddress[messageAddressHash(_addr)], start, limit);
    }

    function listMessageSubjectByMe(uint256 start, uint256 limit) override external view returns (bytes32[] memory){
        return listMessageSubjectBy(msg.sender, start, limit);
    }

    function messageSubjectFromId(bytes32[] storage ids,uint256 start, uint256 limit) internal view returns (bytes32[] memory){
        uint index = 0;
        uint len = ids.length;
        uint256 arrayLen = len;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        bytes32[] memory result = new bytes32[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            bytes32 curId = ids[j];
            result[index++] = curId;
        }
        return result;
    }

    function messageFromId(uint256[] storage ids,uint256 start, uint256 limit) internal view returns (Message[] memory){
        uint index = 0;
        uint len = ids.length;
        uint256 arrayLen = len;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        Message[] memory result = new Message[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            uint256 curId = ids[j];
            Message storage tmp = messageById[curId];
            result[index++] = tmp;
        }
        return result;
    }
    
    function sendMessage(bytes32 subjectId, Message calldata message) override external{
        (bool success,bytes memory data) = messageLibAddress.delegatecall(
            abi.encodeWithSignature("sendMessage(bytes32,(uint256,bytes32,bytes,bytes,bytes,bytes,bytes32,bytes32,uint256))", subjectId, message)
        );
        require(success, string(data));
    }

    function deleteMessage(uint256 id) external{
        Message storage old = messageById[id];
        bytes32 senderHash = messageAddressHash(msg.sender);
        require(old.sender==senderHash, "Messages: not sender");
        removeByValueId(messageBySender[old.sender], id);
        removeByValueId(messageByReceiver[old.receiver], id);
        removeByValueId(messageBySubjectId[old.subjectId], id);
        delete messageById[id];
    }

    function removeByValueId(uint256[] storage values, uint256 value) internal returns(uint) {
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
}