// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;
import "./AbstractContract.sol";

interface MessageContractInterface {

    function sendMessage(bytes32 subjectId, Message calldata message) external;

    struct Message {
        uint256 id;
        bytes32 subjectId;
        bytes senderPubKey;
        bytes receiverPubKey;
        bytes encryptMessage;
        bytes myEncryptMessage;
        bytes32 sender;
        bytes32 receiver;
        uint256 date;
    }
}

interface MessageContractViewInterface is MessageContractInterface{
    function counMessage() external view returns (uint256);
    function counMessageReceivedBy(address) external view returns (uint256);
    function counMessageSentBy(address) external view returns (uint256);
    function counMessageReceivedByMe() external view returns (uint256);
    function counMessageSentByMe() external view returns (uint256);
    function listMessageBySubject(bytes32,uint256 start, uint256 limit) external view returns (Message[] memory);
    function listMessageReceivedBy(address,uint256 start, uint256 limit) external view returns (Message[] memory);
    function listMessageSentBy(address,uint256 start, uint256 limit) external view returns (Message[] memory);
    function listMessageReceivedByMe(uint256 start, uint256 limit) external view returns (Message[] memory);
    function listMessageSentByMe(uint256 start, uint256 limit) external view returns (Message[] memory);
    function listMessageSubjectBy(address,uint256 start, uint256 limit) external view returns (bytes32[] memory);
    function listMessageSubjectByMe(uint256 start, uint256 limit) external view returns (bytes32[] memory);
}