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
import "./MessageContractInterface.sol";
//removed IERC777Sender
abstract contract MessageContractAbstract is MessageContractInterface {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    mapping(uint256 => Message) public messageById;
    mapping(bytes32 => uint256[]) public messageBySender;
    mapping(bytes32 => uint256[]) public messageByReceiver;
    mapping(bytes32 => uint256) public messageSubjectCount;
    mapping(bytes32 => uint256[]) public messageBySubjectId;
    mapping(bytes32 => bytes32[]) public messageSubjectByAddress;
    Counters.Counter internal _messageCounter;
    address internal messageLibAddress;
    //EVENTS
    event OnSend(Message message);

    function messageAddressHash(address _addr) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_addr));
    }
}