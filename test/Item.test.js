const { expect, assert } = require('chai')

//TODO implement tests for Item ERC721
// Import utilities from Test Helpers

const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

/**
 * Item NFT
 */
const Item = artifacts.require('./Item.sol');

require('chai')
  .use(require('chai-as-promised'))
  .should()

/**
* CHAIN ID 1337
*/
contract('Item', (accounts) => {
  

  /**
   * Item control
   */
  const owner = accounts[0]
  let ownerBalance

  const admin = accounts[1]
  const authorizer = accounts[2]

  const unknownAddress = accounts[4]
  
  const redAtt = "0x010501018b01"
  const greenAtt = "0x02040201a000"
  const blueAtt = "0x03030a5a8b01"

  const uri = "https://www.github.com/nft/"

  const getTokenURI = (type, id) => {
    return uri + type + `/${id}.json`; 
  }

  let nftToken

  const firstNFT_ID = 0
  const secondNFT_ID = 1
  const thirdNFT_ID = 2

  before(async () => {
    nftToken = await Item.deployed()
    console.log("NFT TOKEN ADDRESS", nftToken.address)
    console.log("NFT TOKEN OWNER", owner)
  })

  describe('NFT deployment', async () => {
    it('deploy token successfully', async () => {
      const address = nftToken.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has as name', async () => {
      const name = await nftToken.name()
      assert.equal(name, 'Item')
    })

    it('has a symbol', async () => {
      const symbol = await nftToken.symbol()
      assert.equal(symbol, 'ITM')
    })

    it('has an owner', async () => {
      const value = await nftToken.owner()
      assert.equal(value, owner)
    })
  })

  describe('prohibited methods contract', async () => {
    it(`set admin with ${admin} when been no the contract owner`, async () => {
      await expectRevert(
        nftToken.setAdmin(admin, {from: admin}),
        "Ownable: caller is not the owner"
      )
    })

    it(`set authorizer with ${authorizer} when been no contract owner`, async () => {
      await expectRevert(
        nftToken.setAuthorizer(authorizer, {from: authorizer}),
        "Ownable: caller is not the owner"
      )
    })

    it(`set uri with ${admin} when been no contract owner`, async () => {
      await expectRevert.unspecified(
        nftToken.setURI(uri, {from: admin})
      )
    })

    it(`pause when been no the contract admin`, async () => {
      await expectRevert.unspecified(
        nftToken.pause({from: admin}))
    })

    it(`unpause when been no the contract admin`, async () => {
      await expectRevert.unspecified(
        nftToken.unpause({from: admin}))
    })

    it(`safe mint item when been no the contract admin`, async () => {
      const attributes = "0x000000000000"
      await expectRevert.unspecified(
        nftToken.safeMintItem(admin, attributes, {from: admin}))
    })

    it(`update attributes when been no the contract admin`, async () => {
      const attributes = "0x000000000000"
      await expectRevert.unspecified(
        nftToken.updateAttributes(0, attributes, {from: admin}))
    })
  })

  describe('test all item rules methods', async () => {

    /**
     * Type
     */
    it('check red type', async () => {
      const t = await nftToken.getType(redAtt)
      assert.equal(t, "red")
    })

    it('check green type', async () => {
      const t = await nftToken.getType(greenAtt)
      assert.equal(t, "green")
    })

    it('check blue type', async () => {
      const t = await nftToken.getType(blueAtt)
      assert.equal(t, "blue")
    })
  })

  describe('mint methods', async () => {
    
    it(`${owner} mint when been the contract owner`, async () => {
      const beforeMint = await nftToken.balanceOf(admin)
      expect(beforeMint).to.be.a.bignumber.equal(new BN(0))
      
      await nftToken.safeMintItem(admin, redAtt, {from: owner})
      await nftToken.safeMintItem(admin, greenAtt, {from: owner})
      await nftToken.safeMintItem(admin, blueAtt, {from: owner})

      const afterMint = await nftToken.balanceOf(admin)
      expect(afterMint).to.be.a.bignumber.equal(new BN(3))
    })

    it(`check token URIs`, async () => {
      const redURI = await nftToken.tokenURI(firstNFT_ID)
      assert.equal(redURI, getTokenURI("red", firstNFT_ID))
      const greenURI = await nftToken.tokenURI(secondNFT_ID)
      assert.equal(greenURI, getTokenURI("green", secondNFT_ID))
      const blueURI = await nftToken.tokenURI(thirdNFT_ID)
      assert.equal(blueURI, getTokenURI("blue", thirdNFT_ID))
    })

    it(`check all tokens from ${admin}`, async () => {
      const token0 = await nftToken.tokenOfOwnerByIndex(admin, 0)
      assert.equal(token0, firstNFT_ID)
      const token1 = await nftToken.tokenOfOwnerByIndex(admin, 1)
      assert.equal(token1, secondNFT_ID)
      const token2 = await nftToken.tokenOfOwnerByIndex(admin, 2)
      assert.equal(token2, thirdNFT_ID)
    })

    it(`check all tokens attributes from ${admin}`, async () => {
      const redTokenAtt = await nftToken.getAttributes(firstNFT_ID)
      assert.equal(redTokenAtt, redAtt)
      const greenTokenAtt = await nftToken.getAttributes(secondNFT_ID)
      assert.equal(greenTokenAtt, greenAtt)
      const blueTokenAtt = await nftToken.getAttributes(thirdNFT_ID)
      assert.equal(blueTokenAtt, blueAtt)
    })

    it(`check details from ${admin} tokens`, async () => {
      const redDetail = await nftToken.getDetail(firstNFT_ID)
      assert.equal(redDetail.attributes, redAtt)
      assert.equal(redDetail.minted, false)
      assert.equal(redDetail.modifiedBy, owner)

      const greenDetail = await nftToken.getDetail(secondNFT_ID)
      assert.equal(greenDetail.attributes, greenAtt)
      assert.equal(greenDetail.minted, false)
      assert.equal(greenDetail.modifiedBy, owner)

      const blueDetail = await nftToken.getDetail(thirdNFT_ID)
      assert.equal(blueDetail.attributes, blueAtt)
      assert.equal(blueDetail.minted, false)
      assert.equal(blueDetail.modifiedBy, owner)
    })
  })

  describe('update attributes', async () => {
    it(`${owner} update attributes manually`, async () => {
      let redAttributes = await nftToken.getAttributes(firstNFT_ID)
      let firstTokenType = await nftToken.getType(redAttributes)
      assert.equal(firstTokenType, "red")

      
      const newAttributes = "0x020101010101"
      await nftToken.updateAttributes(firstNFT_ID, newAttributes)

      const firstTokenAttributes = await nftToken.getAttributes(firstNFT_ID)
      const firstTokenNewType = await nftToken.getType(firstTokenAttributes)
      assert.equal(firstTokenNewType, "green")

      
      await nftToken.updateAttributes(firstNFT_ID, redAtt)
      redAttributes = await nftToken.getAttributes(firstNFT_ID)
      firstTokenType = await nftToken.getType(redAttributes)
      assert.equal(firstTokenType, "red")
    })
  })

 
  describe('mint token', async () => {
    const mintTokenAuthorizedAt = 1652245218
    const mintTokenAuthorization = "0x81b05400ddce2ed0a479327082576a23236c80dddc470cc6a58fc6cc4bcf437e37e1d3dd680ece6d3622b7caa58f44a84131190174ec5aee659b907ebff7aea21c"
    const attributes = "0x020101010101"
    const claimer = admin
    const cost = 1000000000000000000 * 0.18

    it(`check nft contract balance`, async () => {
      const balance = await web3.eth.getBalance(nftToken.address)
      assert.equal(balance, 0)
    })

    it(`${claimer} mint token using authorization, but changed attributes`, async () => {
      const manipulatedAttributes = "0x0205aaaaaa01"
      await expectRevert(
        nftToken.mintAuthorized(manipulatedAttributes, mintTokenAuthorizedAt, mintTokenAuthorization, {from: claimer}),
        "Item: not authorized")
    })

    it(`${claimer} mint token using modified authorization`, async () => {
      const modifiedMintTokenAuthorization = "0xa2f321f9c33ecdbe4c111e735eb2c1a68ab445965fcd78f92681f00707cdb56657839cd657f6f9e328793631aadb1419fcbff57201d8c9a00ef712a3bc99e9aa1a"
      await expectRevert(
        nftToken.mintAuthorized(attributes, mintTokenAuthorizedAt, modifiedMintTokenAuthorization, {from: claimer}), 
        "ECDSA: invalid signature 'v' value.")
    })

    it(`${unknownAddress} try to mint token using authorization from other user`, async () => {
      await expectRevert(
        nftToken.mintAuthorized(attributes, mintTokenAuthorizedAt, mintTokenAuthorization, {from: unknownAddress}), 
        "Item: not authorized")
    })

    it(`${claimer} mint token using authorization with no ether amount asked`, async () => {
      const value = 1000000000000000000 * 0.17
      await expectRevert(
        nftToken.mintAuthorized(attributes, mintTokenAuthorizedAt, mintTokenAuthorization, {from: claimer, value: value}),
        "Item: not value")
    })

    it(`${claimer} mint token using authorization`, async () => {
      const mintedEvent = await nftToken.mintAuthorized(attributes, mintTokenAuthorizedAt, mintTokenAuthorization, {from: claimer, value: cost})
      expectEvent(mintedEvent, 'Mint', { _address: claimer, _tokenId: new BN(3), _signature: mintTokenAuthorization })
      const mintedNFT_ID = 3
      const mintedTokenAtt = await nftToken.getAttributes(mintedNFT_ID)
      assert.equal(mintedTokenAtt, attributes)
    })

    it(`${claimer} mint token using authorization by second time`, async () => {
      await expectRevert(
        nftToken.mintAuthorized(attributes, mintTokenAuthorizedAt, mintTokenAuthorization, {from: claimer}), 
        "Item: not authorized")
    })

    it(`check nft contract balance after mint (earn token)`, async () => {
      const balance = await web3.eth.getBalance(nftToken.address)
      assert.equal(balance, cost)
    })

    it(`check nft contract balance after mint via NFT token function`, async () => {
      const balanceUsingToken = await nftToken.getBalance({from: owner})
      assert.equal(balanceUsingToken, cost)
    })

    it(`owner balance`, async () => {
      ownerBalance = await web3.eth.getBalance(owner)
    })

    it(`${owner} withdraw earned ethers with users mint token (earn)`, async () => {
      await nftToken.withdraw({from: owner})
      const newOwnerBalance = await web3.eth.getBalance(owner)
      expect(parseInt(newOwnerBalance)).to.be.gte(parseInt(ownerBalance))
    })

    it(`check new nft token balance`, async () => {
      const nftTokenBalance = await web3.eth.getBalance(nftToken.address)
      assert.equal(nftTokenBalance, 0)
    })

    it(`check new nft token balance via NFT token function`, async () => {
      const balanceUsingToken = await nftToken.getBalance({from: owner})
      assert.equal(balanceUsingToken, 0)
    })
  })
})
