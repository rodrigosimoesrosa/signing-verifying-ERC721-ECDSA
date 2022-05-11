# Ethereum signing and verifying token ERC721 (ECDSA)

This project implements a method that gives that users could mint according to an authorization signed by the contract authorizer. Therefore saving gas and money.
I'm using the Elliptic curve digital signature algorithm which encryption native to the blockchain.

This code was made following the studies and examples according to these good articles below:

:link: [EIP-712](https://eips.ethereum.org/EIPS/eip-712)
:link: [sign-it-like-you-mean-it-creating-and-verifying-ethereum-signatures](https://forum.openzeppelin.com/t/sign-it-like-you-mean-it-creating-and-verifying-ethereum-signatures/697)
:link: [signing-and-verifying-messages-in-ethereum](https://programtheblockchain.com/posts/2018/02/17/signing-and-verifying-messages-in-ethereum/)
:link: [ECDSA](https://www.hypr.com/elliptic-curve-digital-signature-algorithm/)

The token (ERC721) contains a method that expects some parameters, and it has the purpose to check if the authorization is valid or not.

Another very important feature is that the token can be changed your details attributes (bytes6) and using a dictionary to represent some information you could store more data.

:white_check_mark: Solidity code
:white_check_mark: Unit tests
:white_check_mark: Authorizer script

## Running Authorizer script :rocket:

Replace the values in the unit tests (/test) by the generated values

    npm run mint

## Running unit test :rocket:

    npm run test	