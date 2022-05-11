function getEthSignWithoutMetamask(account, data) {
    const { signTypedData } = require('@metamask/eth-sig-util');
    
    let privateKey = account.privateKey;
    if (!privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
  
    // 64 hex characters + hex-prefix
    if (privateKey.length !== 66) {
      throw new Error("Private key must be 32 bytes long");
    }
  
    privateKey = Buffer.from(privateKey.substring(2), 'hex');
    const version = "V4";
    
    console.log("\nEIP 712 DATA:\n", JSON.stringify(data));
    return signTypedData({ privateKey , data , version });
}
  
function generateAuthorization(account, claimer, attributes, authorizedAt, chainId, verifyingContract) {
  const { getSignedAuthorizationMessage } = require('./eip712/mint.js');
  const authorizer = account.address;
  const eip712 = getSignedAuthorizationMessage(authorizer, claimer, attributes, authorizedAt, chainId, verifyingContract);
  const authorization = getEthSignWithoutMetamask(account, eip712);
  
  return authorization;
}

module.exports = {
  generateAuthorization,
  getEthSignWithoutMetamask
};
