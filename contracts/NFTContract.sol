// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTContract is ERC1155PresetMinterPauser {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(uint256 => string) private _uris;

    constructor() ERC1155PresetMinterPauser("ipfs://") {}

    function uri(uint256 id) public view virtual override returns (string memory) {
        return _uris[id];
    }    
    
    function mint(
        address to,
        string memory uri_,
        uint256 amount,
        bytes memory data
    ) public virtual {
        _tokenIds.increment();
        uint256 id = _tokenIds.current();
        _uris[id] = uri_;
        super.mint(to, id, amount, data);
    }

    function mintBatch(
        address to,
        string[] memory uris,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual {
        uint[] memory ids = new uint[](uris.length);
        for (uint256 i = 0; i < uris.length; i++) {
            _tokenIds.increment();
            uint256 id = _tokenIds.current();
            ids[i] = id;
            _uris[id] = uris[i];
        }
        super.mintBatch(to, ids, amounts, data);
    }
}