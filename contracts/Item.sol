// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "./ItemBase.sol";

contract Item is ItemBase {

    event Mint(address indexed _address, uint256 _tokenId, bytes _signature);
    
    constructor() ERC721("Item", "ITM") {}

    function mintAuthorized(bytes6 attributes, uint authorizedAt, bytes memory signature) public payable {
        require(authorizer() != address(0));
        
        require(isMintTokenAuthorized(attributes, authorizedAt, signature), "Item: not authorized");
        _usedMintTokenAuth[signature] = msg.sender;

        require(msg.value >= 0.18 ether, "Item: not value");
        
        uint256 tokenId = _safeMintItem(msg.sender, attributes, authorizer(), true);
        emit Mint(msg.sender, tokenId, signature);
    }

    function getBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: getBalance()}("");
        require(success);
    }
}
