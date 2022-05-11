// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

abstract contract ItemBase is ERC721, ERC721Enumerable, Pausable, Ownable {

    using Strings for uint256;    
    using ECDSA for bytes32;
    using Counters for Counters.Counter;
    
    Counters.Counter internal _tokenIdCounter;

    struct Detail {
        uint createAt;
        bytes6 attributes;   
        address modifiedBy;
        bool minted;
    }

    address private _admin;
    address private _authorizer;

    string internal _uri = "https://www.github.com/nft/";

    mapping (uint256 => Detail) internal _tokensDetail;
    mapping (bytes => address) internal _usedMintTokenAuth;
    
    // Domain Separator is the EIP-712 defined structure that defines what contract
    // and chain these signatures can be used for.
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#definition-of-domainseparator
    bytes32 private DOMAIN_SEPARATOR;

    // The typehash for the data type specified in the structured data
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#rationale-for-typehash
    bytes32 internal MINT_AUTH;

    constructor() {
        setAuthorizer(msg.sender);
        setAdmin(msg.sender);
        
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("Item")),
                keccak256(bytes("V1")),
                block.chainid,
                address(this)
            )
        );

        MINT_AUTH = keccak256(
            "MintNFT(address authorizer,address claimer,bytes6 attributes,uint authorizedAt,address verifyingContract)");
    }

    function isMintTokenAuthorized(bytes6 attributes, uint authAt, bytes memory signature) internal view returns (bool) {
        if(_usedMintTokenAuth[signature] != address(0)) {
            return false;
        }

        bytes32 digest = ECDSA.toTypedDataHash(
            DOMAIN_SEPARATOR, 
            keccak256(
                abi.encode(
                    MINT_AUTH,
                    authorizer(),
                    msg.sender,
                    attributes,
                    authAt,
                    address(this)
                )
            )
        );
        return digest.recover(signature) == authorizer();
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function pause() public onlyAdmin {
        _pause();
    }

    function unpause() public onlyAdmin {
        _unpause();
    }

    function safeMintItem(address to, bytes6 attributes) public onlyAdmin {
        _safeMintItem(to, attributes, admin(), false);
    }

    function _safeMintItem(address to, bytes6 attributes, address modifiedBy, bool minted) internal returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        _tokensDetail[tokenId] = Detail(block.timestamp, attributes, modifiedBy, minted);
        return tokenId;
    }

    function updateAttributes(uint256 tokenId, bytes6 attributes) public onlyAdmin {
        require(_exists(tokenId));
        Detail storage details = _tokensDetail[tokenId];
        details.attributes = attributes;
        details.modifiedBy = admin();
    }

    function getAttributes(uint256 tokenId) public view returns (bytes6) {
        require(_exists(tokenId));
        return _tokensDetail[tokenId].attributes;
    }

    modifier onlyAdmin {
        require(admin() == msg.sender);
        _;
    }

    function setAdmin(address _address) public onlyOwner {
        _admin = _address;
    }

    function setAuthorizer(address _address) public onlyOwner {
        _authorizer = _address;
    }

    function admin() public view returns (address) {
        return _admin;
    }

    function authorizer() public view returns (address) {
        return _authorizer;
    }

    function setURI(string memory uri) public onlyAdmin {
        _uri = uri;
    }
    
    function getDetail(uint256 tokenId) public view onlyAdmin returns (uint createdAt, bytes6 attributes, address modifiedBy, bool minted) {
        require(_exists(tokenId));
        Detail memory detail = _tokensDetail[tokenId];
        return (detail.createAt, detail.attributes, detail.modifiedBy, detail.minted);
    }

    function _baseURI() internal view override returns (string memory) {
        return _uri;
    }

    function getTokenURI(uint256 tokenId, bytes6 attributes) internal view returns (string memory) {
        return string(abi.encodePacked(_baseURI(), getType(attributes), "/", tokenId.toString(), ".json"));
    }

    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        require(_exists(tokenId));
        return getTokenURI(tokenId, _tokensDetail[tokenId].attributes);
    }

    function getType(bytes6 attributes) public pure returns (string memory) {
        return obtainType(attributes[0]);
    }

    function obtainType(bytes1 nftType) internal pure returns (string memory) {
        if (isRed(nftType)) {
            return "red";
        }

        if (isGreen(nftType)) {
            return "green";
        }

        if (isBlue(nftType)) {
            return "blue";
        }

        return "unknown";
    }

    function isRed(bytes1 nftType) public pure returns (bool) {
        return keccak256(abi.encodePacked(nftType)) == keccak256(abi.encodePacked(bytes1(0x01)));
    }

    function isGreen(bytes1 nftType) public pure returns (bool) {
        return keccak256(abi.encodePacked(nftType)) == keccak256(abi.encodePacked(bytes1(0x02)));
    }

    function isBlue(bytes1 nftType) public pure returns (bool) {
        return keccak256(abi.encodePacked(nftType)) == keccak256(abi.encodePacked(bytes1(0x03)));
    }
}
