// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenContract is ERC777, Ownable {

   constructor(string memory name_, string memory symbol_, uint256 initial_) ERC777(name_, symbol_, new address[](0)) {
        _mint(msg.sender, initial_  * 10 ** 18, "", "");
    }
}