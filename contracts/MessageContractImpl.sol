// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;
import "./MessageContractAbstract.sol";
import "./AbstractContract.sol";
import "hardhat/console.sol";

//removed IERC777Sender
contract MessageContractImpl is MessageContractAbstract {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    
    function sendMessage(bytes32 subjectId, Message calldata message) override external{
        //MESSAGE
        _messageCounter.increment();
        uint256 id = _messageCounter.current();
        bytes32 senderHash = messageAddressHash(msg.sender);
        bytes32 receiverHash = message.receiver;
        messageById[id] = Message({
            id: id,
            subjectId: subjectId,
            senderPubKey: message.senderPubKey,
            receiverPubKey: message.receiverPubKey,
            encryptMessage: message.encryptMessage,
            myEncryptMessage: message.myEncryptMessage,
            sender: senderHash,
            receiver: receiverHash,
            date: block.timestamp
        });
        messageBySender[senderHash].push(id);
        messageByReceiver[receiverHash].push(id);
        messageBySubjectId[subjectId].push(id);
        //SUBJECT
        if(messageSubjectCount[subjectId] == 0){
            messageSubjectByAddress[senderHash].push(subjectId);
            messageSubjectByAddress[receiverHash].push(subjectId);
        }
        messageSubjectCount[subjectId]++;
        //EMIT
        emit OnSend(messageById[id]);
    }
}